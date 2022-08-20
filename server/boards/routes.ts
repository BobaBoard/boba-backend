import * as threadEvents from "handlers/events/threads";

import { BoardPermissions, RealmPermissions } from "types/permissions";
import { CacheKeys, cache } from "server/cache";
import {
  createThread,
  dismissBoardNotifications,
  markBoardVisit,
  muteBoard,
  pinBoard,
  unmuteBoard,
  unpinBoard,
  updateBoardMetadata,
} from "./queries";
import {
  ensureBoardAccess,
  ensureBoardPermission,
  ensureRealmPermission,
  withRealmPermissions,
} from "handlers/permissions";
import {
  ensureNoIdentityLeakage,
  makeServerThread,
} from "utils/response-utils";

import { NotFound404Error } from "types/errors/api";
import debug from "debug";
import { ensureLoggedIn } from "handlers/auth";
import express from "express";
import { getBoardMetadataByUuid } from "./utils";
import { getThreadByStringId } from "server/threads/queries";

const info = debug("bobaserver:board:routes-info");
const log = debug("bobaserver:board:routes");

const router = express.Router();

/**
 * @openapi
 * /boards/{board_id}:
 *   get:
 *     summary: Fetches board metadata.
 *     operationId: getBoardsByUuid
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *       - {}
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The uuid of the board to retrieve metadata for.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           existing:
 *             summary: An existing board
 *             value: c6d3d10e-8e49-4d73-b28a-9d652b41beec
 *           locked:
 *             summary: A board for logged in users only
 *             value: 76ebaab0-6c3e-4d7b-900f-f450625a5ed3
 *     responses:
 *       401:
 *         description: User was not found and board requires authentication.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example: { message: "User must be authenticated to access board." }
 *       403:
 *         description: User is not authorized to fetch the metadata of this board.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example: { message: "User does not have required permission to access board." }
 *       404:
 *         description: The board was not found.
 *         $ref: "#/components/responses/default404"
 *       200:
 *         description: The board metadata.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: "#/components/schemas/BoardMetadata"
 *                 - $ref: "#/components/schemas/LoggedInBoardMetadata"
 *             examples:
 *               existing:
 *                 $ref: '#/components/examples/BoardsGoreResponse'
 *               locked:
 *                 $ref: '#/components/examples/BoardsRestrictedResponse'
 */
router.get("/:board_id", ensureBoardAccess, async (req, res) => {
  const { board_id: boardId } = req.params;
  log(`Fetching data for board with uuid ${boardId}.`);

  const boardMetadata = await getBoardMetadataByUuid({
    firebaseId: req.currentUser?.uid,
    boardId,
    hasBoardAccess: true,
  });

  log(`Returning data for board ${boardId} for user ${req.currentUser?.uid}.`);
  res.status(200).json(boardMetadata);
});

/**
 * @openapi
 * /boards/{board_id}:
 *   post:
 *     summary: Create a new thread.
 *     operationId: createThread
 *     description: Creates a new thread in the specified board.
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The id for the board in which the thread will be created.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           goreBoardId:
 *             summary: The id for the gore board.
 *             value: c6d3d10e-8e49-4d73-b28a-9d652b41beec
 *     requestBody:
 *       description: request body
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateThread"
 *           examples:
 *             requestBody:
 *               $ref: "#/components/examples/createGoreTestThread"
 *       required: true
 *     responses:
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureBoardPermission403"
 *       404:
 *         $ref: "#/components/responses/boardNotFound404"
 *       200:
 *         description: Thread has been created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Thread"
 *             examples:
 *               response:
 *                 $ref: "#/components/examples/createGoreTestThreadResponse"
 */
router.post(
  "/:board_id",
  ensureLoggedIn,
  ensureBoardAccess,
  ensureRealmPermission(RealmPermissions.postOnRealm),
  //TODO: ensureBoardPermission(BoardPermissions.createThread),
  async (req, res, next) => {
    const { board_id: boardId } = req.params;

    log(`Fetching metadata for board with id ${boardId}`);
    const boardMetadata = await getBoardMetadataByUuid({
      firebaseId: req.currentUser?.uid,
      boardId,
      hasBoardAccess: true,
    });
    const boardSlug = boardMetadata.slug;
    log(`Creating thread in board with id ${boardId}`);
    const {
      content,
      forceAnonymous,
      defaultView,
      large,
      whisperTags,
      indexTags,
      categoryTags,
      contentWarnings,
      identityId,
      accessoryId,
    } = req.body;

    const threadStringId = await createThread({
      firebaseId: req.currentUser.uid,
      content,
      defaultView,
      anonymityType: "everyone",
      isLarge: !!large,
      boardStringId: boardId,
      whisperTags,
      indexTags,
      categoryTags,
      contentWarnings,
      identityId,
      accessoryId,
    });
    info(`Created new thread`, threadStringId);

    const thread = await getThreadByStringId({
      threadId: threadStringId as string,
      firebaseId: req.currentUser?.uid,
    });

    if (!thread) {
      throw new NotFound404Error(
        `Thread with id ${threadStringId} was not found after being created.`
      );
    }

    info(`Found thread: `, thread);
    const serverThread = makeServerThread(thread);
    ensureNoIdentityLeakage(serverThread);

    info(`sending back data for thread ${serverThread.id}.`);
    res.status(200).json(serverThread);

    log(
      `generating webhook for thread ${serverThread.id} in board ${boardSlug}`
    );

    threadEvents.emit(threadEvents.EVENT_TYPES.THREAD_CREATED, {
      thread: serverThread,
    });
  }
);

/**
 * @openapi
 * /boards/{board_id}:
 *   patch:
 *     summary: Update board metadata
 *     operationId: patchBoardsByUuid
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The uuid of the board to update metadata for.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           existing:
 *             summary: An existing board (gore)
 *             value: c6d3d10e-8e49-4d73-b28a-9d652b41beec
 *     requestBody:
 *       description: request body
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/BoardDescription"
 *           examples:
 *             gore:
 *               $ref: "#/components/examples/GoreMetadataUpdateBody"
 *       required: false
 *     responses:
 *       401:
 *         description: User was not found.
 *         $ref: "#/components/responses/default401"
 *       403:
 *         description: User is not authorized to update the metadata of this board.
 *         $ref: "#/components/responses/default403"
 *       404:
 *         description: The board was not found.
 *         $ref: "#/components/responses/default404"
 *       200:
 *         description: The board metadata.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/LoggedInBoardMetadata"
 *             examples:
 *               existing:
 *                 $ref: '#/components/examples/GoreMetadataUpdateResponse'
 */
router.patch(
  "/:board_id/",
  ensureLoggedIn,
  withRealmPermissions,
  ensureBoardPermission(BoardPermissions.editMetadata),
  async (req, res) => {
    const { board_id: boardId } = req.params;
    const { descriptions, accentColor, tagline } = req.body;

    const newMetadata = await updateBoardMetadata({
      boardId,
      firebaseId: req.currentUser.uid,
      oldMetadata: req.currentBoardMetadata,
      newMetadata: { descriptions, settings: { accentColor }, tagline },
    });

    if (!newMetadata) {
      res.status(500).send({ message: `Error while updating board metadata.` });
      return;
    }

    await cache().hdel(CacheKeys.BOARD, boardId);
    await cache().hdel(CacheKeys.BOARD_METADATA, boardId);
    const boardMetadata = await getBoardMetadataByUuid({
      firebaseId: req.currentUser?.uid,
      boardId,
      hasBoardAccess: req.currentRealmPermissions.includes(
        RealmPermissions.accessMemberOnlyContentOnRealm
      ),
    });
    res.status(200).json(boardMetadata);
  }
);
/**
 * @openapi
 * /boards/{board_id}/visits:
 *   get:
 *     summary: Sets last visited time for board
 *     operationId: visitsBoardsByUuid
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The uuid of the board to mark as visited.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       401:
 *         description: User was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example: { "message" : "This board is unavailable to logged out users." }
 *       403:
 *         $ref: "#/components/responses/ensureBoardAccess403"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/responses/default500"
 *       200:
 *         description: The visit was successfully registered.
 */
router.post(
  "/:board_id/visits",
  ensureLoggedIn,
  ensureBoardAccess,
  async (req, res) => {
    const { board_id: boardId } = req.params;
    log(`Setting last visited time for board: ${boardId}`);

    if (
      !(await markBoardVisit({
        firebaseId: req.currentUser.uid,
        boardId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    log(`Marked last visited time for board: ${boardId}.`);
    res.sendStatus(204);
  }
);

/**
 * @openapi
 * /boards/{board_id}/mute:
 *   post:
 *     summary: Mutes a board.
 *     operationId: mutesBoardsByUuid
 *     description: Mutes the specified board for the current user.
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The uuid of the board to mute.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           existing:
 *             summary: An existing board
 *             value: c6d3d10e-8e49-4d73-b28a-9d652b41beec
 *     responses:
 *       204:
 *         description: The board was successfully muted.
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureBoardAccess403"
 *       404:
 *         $ref: "#/components/responses/default404"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/responses/default500"
 */
router.post(
  "/:board_id/mute",
  ensureLoggedIn,
  ensureBoardAccess,
  async (req, res) => {
    const { board_id: boardId } = req.params;

    if (
      !(await muteBoard({
        firebaseId: req.currentUser.uid,
        boardId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    await cache().hdel(CacheKeys.BOARD, boardId);
    await cache().hdel(CacheKeys.USER, req.currentUser.uid);

    info(`Muted board: ${boardId} for user ${req.currentUser.uid}.`);
    res.sendStatus(204);
  }
);

/**
 * @openapi
 * /boards/{board_id}/mute:
 *   delete:
 *     summary: Unmutes a board.
 *     operationId: unmutesBoardsByUuid
 *     description: Unmutes the specified board for the current user.
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The name of the board to unmute.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureBoardAccess403"
 *       404:
 *         $ref: "#/components/responses/default404"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/responses/default500"
 *       204:
 *         description: The board was successfully unmuted.
 *
 */
router.delete(
  "/:board_id/mute",
  ensureLoggedIn,
  ensureBoardAccess,
  async (req, res) => {
    const { board_id: boardId } = req.params;

    if (
      !(await unmuteBoard({
        firebaseId: req.currentUser.uid,
        boardId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    await cache().hdel(CacheKeys.BOARD, boardId);
    await cache().hdel(CacheKeys.USER, req.currentUser.uid);

    info(`Unmuted board: ${boardId} for user ${req.currentUser.uid}.`);
    res.sendStatus(204);
  }
);

/**
 * @openapi
 * /boards/{board_id}/pin:
 *   post:
 *     summary: Pins a board.
 *     operationId: pinsBoardsByUuid
 *     description: Pins the specified board for the current user.
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The name of the board to pin.
 *         required: true
 *         schema:
 *           type: string
 *           # format: uuid
 *     responses:
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureBoardAccess403"
 *       404:
 *         $ref: "#/components/responses/default404"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/responses/default500"
 *       204:
 *         description: The board was successfully pinned.
 *
 */
router.post(
  "/:board_id/pin",
  ensureLoggedIn,
  ensureBoardAccess,
  async (req, res) => {
    const { board_id: boardId } = req.params;

    if (
      !(await pinBoard({
        firebaseId: req.currentUser.uid,
        boardId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    await cache().hdel(CacheKeys.BOARD, boardId);
    await cache().hdel(CacheKeys.USER, req.currentUser.uid);

    info(`Pinned board: ${boardId} for user ${req.currentUser.uid}.`);
    res.sendStatus(204);
  }
);

/**
 * @openapi
 * /boards/{board_id}/pin:
 *   delete:
 *     summary: Unpins a board.
 *     operationId: unpinsBoardsByUuid
 *     description: Unpins the specified board for the current user.
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The name of the board to unpin.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureBoardAccess403"
 *       404:
 *         $ref: "#/components/responses/default404"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/responses/default500"
 *       204:
 *         description: The board was successfully unpinned.
 *
 */
router.delete(
  "/:board_id/pin",
  ensureLoggedIn,
  ensureBoardAccess,
  async (req, res) => {
    const { board_id: boardId } = req.params;

    log(`Setting board unpinned: ${boardId}`);

    if (
      !(await unpinBoard({
        firebaseId: req.currentUser.uid,
        boardId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    await cache().hdel(CacheKeys.BOARD, boardId);
    await cache().hdel(CacheKeys.USER, req.currentUser.uid);

    info(`Unpinned board: ${boardId} for user ${req.currentUser?.uid}.`);
    res.sendStatus(204);
  }
);

/**
 * @openapi
 * /boards/{board_id}/notifications:
 *   delete:
 *     summary: Dismiss all notifications for board
 *     operationId: dismissBoardsByUuid
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The uuid of the board to dismiss notifications for.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           existing:
 *             summary: An existing board
 *             value: c6d3d10e-8e49-4d73-b28a-9d652b41beec
 *     responses:
 *       401:
 *         description: User is not logged in.
 *         $ref: "#/components/responses/default401"
 *       403:
 *         $ref: "#/components/responses/ensureBoardAccess403"
 *       404:
 *         $ref: "#/components/responses/default404"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/responses/default500"
 *       204:
 *         description: Board notifications dismissed.
 */
router.delete(
  "/:board_id/notifications",
  ensureLoggedIn,
  ensureBoardAccess,
  async (req, res) => {
    const { board_id: boardId } = req.params;

    let currentUserId: string = req.currentUser.uid;
    log(
      `Dismissing ${boardId} notifications for firebase id: ${currentUserId}`
    );
    const dismissSuccessful = await dismissBoardNotifications({
      boardId,
      firebaseId: currentUserId,
    });

    if (!dismissSuccessful) {
      log(`Dismiss failed`);
      return res.sendStatus(500);
    }

    info(`Dismiss successful`);

    res.sendStatus(204);
  }
);

export default router;
