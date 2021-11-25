import { CacheKeys, cache } from "server/cache";
import {
  dismissBoardNotifications,
  getBoardByUuid,
  markBoardVisit,
  muteBoard,
  pinBoard,
  unmuteBoard,
  unpinBoard,
  updateBoardMetadata,
} from "./queries";
import { ensureBoardAccess, ensureBoardPermission } from "handlers/permissions";

import { BoardPermissions } from "types/permissions";
import debug from "debug";
import { ensureLoggedIn } from "handlers/auth";
import express from "express";
import { getBoardMetadataByUuid } from "./utils";

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
 *             example: { message: "This board is unavailable to logged out users." }
 *       403:
 *         description: User is not authorized to fetch the metadata of this board.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example: { message: "You don't have permission to access this board." }
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
  });

  log(`Returning data for board ${boardId} for user ${req.currentUser?.uid}.`);
  res.status(200).json(boardMetadata);
});

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
 *         content:
 *           application/json:
 *             examples:
 *               existing:
 *                 $ref: "#/components/examples/PinnedBoardResponse"
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
 *       200:
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
 *       200:
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
 *       200:
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
 * /boards/{board_id}/notifications/dismiss:
 *   post:
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
router.post(
  "/:board_id/notifications/dismiss",
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
