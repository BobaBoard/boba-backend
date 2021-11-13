import { CacheKeys, cache } from "server/cache";
import {
  canAccessBoard,
  canAccessBoardByUuid,
  hasBoardAccessPermission,
  hasPermission,
} from "utils/permissions-utils";
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

import { DbRolePermissions } from "Types";
import debug from "debug";
import { ensureLoggedIn } from "handlers/auth";
import express from "express";
import { getBoardMetadataByUuid } from "./utils";

const info = debug("bobaserver:board:routes-info");
const log = debug("bobaserver:board:routes");

const router = express.Router();

/**
 * Make sure the user can access the board.
 *
 * TODO: turn this into a middleware or a better check.
 */
const ensureBoardAccess = async ({
  firebaseId,
  boardId,
  res,
}: {
  firebaseId: string;
  boardId: string;
  res: express.Response;
}) => {
  const board = await getBoardByUuid({
    firebaseId: firebaseId,
    boardId,
  });
  log(`Found board`, board);

  if (!board) {
    res
      .status(404)
      .send({ message: `The board with id "${boardId}" was not found.` });
    return;
  }

  // if (!hasBoardAccessPermission({ boardMetadata: board, firebaseId })) {
  //   res
  //     .status(403)
  //     .send({ message: `User cannot access board with id "${boardId}".` });
  //   return;
  // }

  return board;
};

/**
 * @openapi
 * /boards/{uuid}:
 *   get:
 *     summary: Fetches board metadata.
 *     operationId: getBoardsByUuid
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *       - {}
 *     parameters:
 *       - name: uuid
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
router.get("/:uuid", async (req, res) => {
  const { uuid: boardId } = req.params;
  log(`Fetching data for board with uuid ${boardId}.`);

  const boardMetadata = await getBoardMetadataByUuid({
    firebaseId: req.currentUser?.uid,
    boardId,
  });

  if (!canAccessBoardByUuid({ boardId, firebaseId: req.currentUser?.uid })) {
    if (!req.currentUser?.uid) {
      // TODO: is this WORKING????
      res
        .status(401)
        .json({ message: "This board is unavailable to logged out users." });
    } else {
      res
        .status(403)
        .json({ message: "You don't have permission to access this board." });
    }
    return;
  }
  if (!boardMetadata) {
    res.sendStatus(404);
    return;
  }

  log(`Returning data for board ${boardId} for user ${req.currentUser?.uid}.`);
  res.status(200).json(boardMetadata);
});

/**
 * @openapi
 * /boards/{uuid}:
 *   patch:
 *     summary: Update board metadata
 *     operationId: patchBoardsByUuid
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: uuid
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
router.patch("/:boardId/", ensureLoggedIn, async (req, res) => {
  const { boardId } = req.params;
  const { descriptions, accentColor, tagline } = req.body;

  const board = await ensureBoardAccess({
    firebaseId: req.currentUser.uid,
    boardId: boardId,
    res,
  });

  // TODO: Error is (temporarily) handled within ensureBoardAccess
  if (!board) {
    return;
  }

  if (!hasPermission(DbRolePermissions.edit_board_details, board.permissions)) {
    res
      .status(403)
      .send({ message: `User cannot access board with id "${boardId}".` });
    return;
  }

  const newMetadata = await updateBoardMetadata({
    boardId,
    firebaseId: req.currentUser.uid,
    oldMetadata: board,
    newMetadata: { descriptions, settings: { accentColor }, tagline },
  });

  if (!newMetadata) {
    res.sendStatus(500);
    return;
  }

  await cache().hdel(CacheKeys.BOARD, boardId);
  await cache().hdel(CacheKeys.BOARD_METADATA, boardId);
  const boardMetadata = await getBoardMetadataByUuid({
    firebaseId: req.currentUser?.uid,
    boardId,
  });
  res.status(200).json(boardMetadata);
});
/**
 * @openapi
 * /boards/{uuid}/visits:
 *   get:
 *     summary: Sets last visited time for board
 *     operationId: visitsBoardsByUuid
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: uuid
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
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/responses/default500"
 *       200:
 *         description: The visit was successfully registered.
 */
router.post("/:boardId/visits", ensureLoggedIn, async (req, res) => {
  const { boardId } = req.params;
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
});

/**
 * @openapi
 * /boards/{uuid}/mute:
 *   post:
 *     summary: Mutes a board.
 *     operationId: mutesBoardsByUuid
 *     description: Mutes the specified board for the current user.
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: uuid
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
 *         $ref: "#/components/responses/ensureLoggedIn403"
 *       404:
 *         $ref: "#/components/responses/default404"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/responses/default500"
 */
router.post("/:boardId/mute", ensureLoggedIn, async (req, res) => {
  const { boardId } = req.params;

  const board = await ensureBoardAccess({
    firebaseId: req.currentUser.uid,
    boardId,
    res,
  });

  // TODO: Error is (temporarily) handled within ensureBoardAccess
  if (!board) {
    return;
  }

  if (
    !(await muteBoard({
      firebaseId: req.currentUser.uid,
      boardId,
    }))
  ) {
    // TODO: figure out how to do a proper 404.
    res.sendStatus(500);
    return;
  }

  await cache().hdel(CacheKeys.BOARD, boardId);
  await cache().hdel(CacheKeys.USER, req.currentUser.uid);

  info(`Muted board: ${boardId} for user ${req.currentUser.uid}.`);
  res.status(204).json();
});

/**
 * @openapi
 * /boards/{uuid}/mute:
 *   delete:
 *     summary: Unmutes a board.
 *     operationId: unmutesBoardsByUuid
 *     description: Unmutes the specified board for the current user.
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: uuid
 *         in: path
 *         description: The name of the board to unmute.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureLoggedIn403"
 *       404:
 *         $ref: "#/components/responses/default404"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/responses/default500"
 *       200:
 *         description: The board was successfully unmuted.
 *
 */
router.delete("/:boardId/mute", ensureLoggedIn, async (req, res) => {
  const { boardId } = req.params;

  const board = await ensureBoardAccess({
    firebaseId: req.currentUser.uid,
    boardId,
    res,
  });

  // TODO: Error is (temporarily) handled within ensureBoardAccess
  if (!board) {
    return;
  }

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
  res.status(204).json();
});

/**
 * @openapi
 * /boards/{uuid}/pin:
 *   post:
 *     summary: Pins a board.
 *     operationId: pinsBoardsByUuid
 *     description: Pins the specified board for the current user.
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: uuid
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
 *         $ref: "#/components/responses/ensureLoggedIn403"
 *       404:
 *         $ref: "#/components/responses/default404"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/responses/default500"
 *       200:
 *         description: The board was successfully pinned.
 *
 */
router.post("/:boardId/pin", ensureLoggedIn, async (req, res) => {
  const { boardId } = req.params;

  const board = await ensureBoardAccess({
    firebaseId: req.currentUser.uid,
    boardId,
    res,
  });

  // TODO: Error is (temporarily) handled within ensureBoardAccess
  if (!board) {
    return;
  }

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
  res.status(204).json();
});

/**
 * @openapi
 * /boards/{uuid}/pin:
 *   delete:
 *     summary: Unpins a board.
 *     operationId: unpinsBoardsByUuid
 *     description: Unpins the specified board for the current user.
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: uuid
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
 *         $ref: "#/components/responses/ensureLoggedIn403"
 *       404:
 *         $ref: "#/components/responses/default404"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/responses/default500"
 *       200:
 *         description: The board was successfully unpinned.
 *
 */
router.delete("/:boardId/pin", ensureLoggedIn, async (req, res) => {
  const { boardId } = req.params;

  log(`Setting board unpinned: ${boardId}`);

  const board = await ensureBoardAccess({
    firebaseId: req.currentUser.uid,
    boardId,
    res,
  });

  // TODO: Error is (temporarily) handled within ensureBoardAccess
  if (!board) {
    return;
  }

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
  res.status(204).json();
});

/**
 * @openapi
 * /boards/{uuid}/notifications/dismiss:
 *   post:
 *     summary: Dismiss all notifications for board
 *     operationId: dismissBoardsByUuid
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: uuid
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
 *         $ref: "#/components/responses/ensureLoggedIn403"
 *       404:
 *         $ref: "#/components/responses/default404"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/responses/default500"
 *       204:
 *         description: Board notifications dismissed.
 */
router.post(
  "/:boardId/notifications/dismiss",
  ensureLoggedIn,
  async (req, res) => {
    const { boardId } = req.params;

    let currentUserId: string = req.currentUser.uid;
    const board = await ensureBoardAccess({
      firebaseId: currentUserId,
      boardId,
      res,
    });

    // TODO: Error is (temporarily) handled within ensureBoardAccess
    if (!board) {
      return;
    }
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

    res.status(204).json();
  }
);

export default router;
