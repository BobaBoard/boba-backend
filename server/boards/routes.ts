import * as threadEvents from "handlers/events/threads";

import {
  BoardMetadataSchema,
  LoggedInBoardMetadataSchema,
} from "types/open-api/generated";
import { BoardPermissions, RealmPermissions } from "types/permissions";
import { CacheKeys, cache } from "server/cache";
import { Internal500Error, NotFound404Error } from "handlers/api-errors/codes";
import {
  createThread,
  dismissBoardNotifications,
  getBoardRoles,
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

import debug from "debug";
import { ensureLoggedIn } from "handlers/auth";
import express from "express";
import { getBoardMetadataByExternalId } from "./utils";
import { getThreadByExternalId } from "server/threads/queries";

const info = debug("bobaserver:board:routes-info");
const log = debug("bobaserver:board:routes");
const error = debug("bobaserver:board:routes-error");

const router = express.Router();

/**
 * @openapi
 * /boards/{board_id}:
 *   get:
 *     summary: Fetches board metadata.
 *     operationId: getBoardsByExternalId
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *       - {}
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The external id of the board to retrieve metadata for.
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
  const { board_id: boardExternalId } = req.params;
  log(`Fetching data for board with external id ${boardExternalId}.`);

  const firebaseId = req.currentUser?.uid;

  const boardMetadata = await getBoardMetadataByExternalId({
    firebaseId: firebaseId,
    boardExternalId,
    hasBoardAccess: req.currentUser ? true : false,
  });

  log(
    `Returning data for board ${boardExternalId} for user ${req.currentUser?.uid}.`
  );
  res
    .status(200)
    .json(
      firebaseId
        ? LoggedInBoardMetadataSchema.parse(boardMetadata)
        : BoardMetadataSchema.parse(boardMetadata)
    );
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
 *       - unzodded
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
 *           goreboardExternalId:
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
  ensureRealmPermission(RealmPermissions.createThreadOnRealm),
  //TODO: ensureBoardPermission(BoardPermissions.createThread),
  async (req, res, next) => {
    const { board_id: boardExternalId } = req.params;

    log(`Fetching metadata for board with id ${boardExternalId}`);
    const boardMetadata = await getBoardMetadataByExternalId({
      firebaseId: req.currentUser?.uid,
      boardExternalId,
      hasBoardAccess: true,
    });
    const boardSlug = boardMetadata!.slug;
    log(`Creating thread in board with id ${boardExternalId}`);
    const {
      content,
      forceAnonymous,
      defaultView,
      whisperTags,
      indexTags,
      categoryTags,
      contentWarnings,
      identityId,
      accessoryId,
    } = req.body;

    const newThreadExternalId = await createThread({
      firebaseId: req.currentUser!.uid,
      content,
      defaultView,
      anonymityType: "everyone",
      boardExternalId: boardExternalId,
      whisperTags,
      indexTags,
      categoryTags,
      contentWarnings,
      identityId,
      accessoryId,
    });
    info(`Created new thread`, newThreadExternalId);

    const thread = await getThreadByExternalId({
      threadExternalId: newThreadExternalId as string,
      firebaseId: req.currentUser?.uid,
    });

    if (!thread) {
      throw new NotFound404Error(
        `Thread with id ${newThreadExternalId} was not found after being created.`
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
 *     operationId: patchBoardsByExternalId
 *     tags:
 *       - /boards/
 *       - unzodded
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The external id of the board to update metadata for.
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
  ensureBoardPermission(BoardPermissions.editMetadata),
  withRealmPermissions,
  async (req, res) => {
    const { board_id: boardExternalId } = req.params;
    const { descriptions, accentColor, tagline } = req.body;

    // TODO: get currentBoardMetadata from the DB
    const newMetadata = await updateBoardMetadata({
      boardExternalId,
      firebaseId: req.currentUser!.uid,
      oldMetadata: req.currentBoardMetadata!,
      newMetadata: { descriptions, settings: { accentColor }, tagline },
    });

    if (!newMetadata) {
      res.status(500).send({ message: `Error while updating board metadata.` });
      return;
    }

    await cache().hDel(CacheKeys.BOARD, boardExternalId);
    await cache().hDel(CacheKeys.BOARD_METADATA, boardExternalId);
    const boardMetadata = await getBoardMetadataByExternalId({
      firebaseId: req.currentUser?.uid,
      boardExternalId,
      hasBoardAccess: req.currentRealmPermissions!.includes(
        RealmPermissions.accessLockedBoardsOnRealm
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
 *     operationId: visitBoardsByExternalId
 *     tags:
 *       - /boards/
 *       - unzodded
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The external id of the board to mark as visited.
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
    const { board_id: boardExternalId } = req.params;
    log(`Setting last visited time for board: ${boardExternalId}`);

    if (
      !(await markBoardVisit({
        firebaseId: req.currentUser!.uid,
        boardExternalId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    log(`Marked last visited time for board: ${boardExternalId}.`);
    res.sendStatus(204);
  }
);

/**
 * @openapi
 * /boards/{board_id}/mute:
 *   post:
 *     summary: Mutes a board.
 *     operationId: muteBoardsByExternalId
 *     description: Mutes the specified board for the current user.
 *     tags:
 *       - /boards/
 *       - unzodded
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The external id of the board to mute.
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
    const { board_id: boardExternalId } = req.params;
    log(`Muting board: ${boardExternalId} for user ${req.currentUser!.uid}.`);

    await muteBoard({
      firebaseId: req.currentUser!.uid,
      boardExternalId,
    });

    await cache().hDel(CacheKeys.BOARD, boardExternalId);
    await cache().hDel(CacheKeys.USER_PINS, req.currentUser!.uid);

    log(`Muted board: ${boardExternalId} for user ${req.currentUser!.uid}.`);
    res.sendStatus(204);
  }
);

/**
 * @openapi
 * /boards/{board_id}/mute:
 *   delete:
 *     summary: Unmutes a board.
 *     operationId: unmuteBoardsByExternalId
 *     description: Unmutes the specified board for the current user.
 *     tags:
 *       - /boards/
 *       - unzodded
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
    const { board_id: boardExternalId } = req.params;

    await unmuteBoard({
      firebaseId: req.currentUser!.uid,
      boardExternalId,
    });

    await cache().hDel(CacheKeys.BOARD, boardExternalId);
    await cache().hDel(CacheKeys.USER_PINS, req.currentUser!.uid);

    info(`Unmuted board: ${boardExternalId} for user ${req.currentUser!.uid}.`);
    res.sendStatus(204);
  }
);

/**
 * @openapi
 * /boards/{board_id}/pin:
 *   post:
 *     summary: Pins a board.
 *     operationId: pinBoardsByExternalId
 *     description: Pins the specified board for the current user.
 *     tags:
 *       - /boards/
 *       - unzodded
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
    const { board_id: boardExternalId } = req.params;

    if (
      !(await pinBoard({
        firebaseId: req.currentUser!.uid,
        boardExternalId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    await cache().hDel(CacheKeys.BOARD, boardExternalId);
    await cache().hDel(CacheKeys.USER_PINS, req.currentUser!.uid);

    info(`Pinned board: ${boardExternalId} for user ${req.currentUser!.uid}.`);
    res.sendStatus(204);
  }
);

/**
 * @openapi
 * /boards/{board_id}/pin:
 *   delete:
 *     summary: Unpins a board.
 *     operationId: unpinBoardsByExternalId
 *     description: Unpins the specified board for the current user.
 *     tags:
 *       - /boards/
 *       - unzodded
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
    const { board_id: boardExternalId } = req.params;

    log(`Setting board unpinned: ${boardExternalId}`);

    if (
      !(await unpinBoard({
        firebaseId: req.currentUser!.uid,
        boardExternalId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    await cache().hDel(CacheKeys.BOARD, boardExternalId);
    await cache().hDel(CacheKeys.USER_PINS, req.currentUser!.uid);

    info(
      `Unpinned board: ${boardExternalId} for user ${req.currentUser?.uid}.`
    );
    res.sendStatus(204);
  }
);

/**
 * @openapi
 * /boards/{board_id}/notifications:
 *   delete:
 *     summary: Dismiss all notifications for board
 *     operationId: dismissBoardsByExternalId
 *     tags:
 *       - /boards/
 *       - unzodded
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The external id of the board to dismiss notifications for.
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
    const { board_id: boardExternalId } = req.params;

    let currentUserId: string = req.currentUser!.uid;
    log(
      `Dismissing ${boardExternalId} notifications for firebase id: ${currentUserId}`
    );
    const dismissSuccessful = await dismissBoardNotifications({
      boardExternalId,
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

/**
 * @openapi
 * /boards/{board_id}/roles:
 *   get:
 *     summary: Fetches latest roles summary for the board.
 *     operationId: getBoardRolesByExternalId
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The id of the board.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: The board roles summary.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RealmRoles"
 *             examples:
 *               twisted_minds:
 *                 value:
 *                   roles:
 *                     - user_firebase_id: "a90b0809-2c57-4ff1-be7c-4b7ab1b7edcc"
 *                       username: "bobatan"
 *                       role_string_id: "3df1d417-c36a-43dd-aaba-9590316ffc32"
 *                       role_name: "The Owner"
 *                       label: "Look ma, a label"
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensurePermission403"
 *       404:
 *         description: The board was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/genericResponse"
 *       500:
 *         description: There was an error fetching board roles.
 */

router.get(
  "/:board_id/roles",
  ensureBoardAccess,
  ensureLoggedIn,
  ensureBoardPermission(BoardPermissions.viewRolesOnBoard),
  async (req, res) => {
    try {
      const { board_id } = req.params;
      const boardRoles = await getBoardRoles({
        boardExternalId: board_id,
      });
      if (!boardRoles?.length) {
        res.status(200).json({ roles: [] });
        return;
      }
      res.status(200).json({
        roles: boardRoles || [],
      });
    } catch (e) {
      error(e);
      throw new Internal500Error("There was an error fetching board roles.");
    }
  }
);

export default router;
