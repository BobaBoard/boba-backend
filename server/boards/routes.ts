import { CacheKeys, cache } from "server/cache";
import { canAccessBoard, canAccessBoardByUuid, hasPermission } from "utils/permissions-utils";
import {
  dismissBoardNotifications,
  getBoardBySlug,
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
import { getBoardMetadata, getBoardMetadataByUuid } from "./utils";
import { processBoardMetadata } from "utils/response-utils";

const info = debug("bobaserver:board:routes-info");
const log = debug("bobaserver:board:routes");

const router = express.Router();

/**
 * @openapi
 * /boards/{uuid}:
 *   get:
 *     summary: Fetches board metadata.
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
 *           # format: uuid
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
 *         $ref: "#/components/schemas/default404"
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
  const { uuid } = req.params;
  log(`Fetching data for board with uuid ${uuid}.`);

  const boardMetadata = await getBoardMetadataByUuid({
    firebaseId: req.currentUser?.uid,
    uuid,
  });

  if (!canAccessBoardByUuid({ uuid, firebaseId: req.currentUser?.uid })) {
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

  log(`Returning data for board ${uuid} for user ${req.currentUser?.uid}.`);
  res.status(200).json(boardMetadata);
});

/**
 * @openapi
 * /boards/{uuid}/metadata/update:
 *   post:
 *     summary: Update boards metadata
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
 *           # format: uuid
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
 *         $ref: "#/components/schemas/default401"
 *       403:
 *         description: User is not authorized to update the metadata of this board.
 *         $ref: "#/components/schemas/default403"
 *       404:
 *         description: The board was not found.
 *         $ref: "#/components/schemas/default404"
 *       200:
 *         description: The board metadata.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UpdatedBoardDescription"
 *             examples:
 *               existing:
 *                 $ref: '#/components/examples/GoreMetadataUpdateResponse'
 */
router.post("/:uuid/metadata/update", ensureLoggedIn, async (req, res) => {
  const { uuid } = req.params;
  const { descriptions, accentColor, tagline } = req.body;

  const board = await getBoardByUuid({
    firebaseId: req.currentUser?.uid,
    uuid,
  });
  log(`Found board`, board);
  console.log(board);

  if (!board) {
    // TOOD: add error log
    return res.sendStatus(404);
  }

  if (!hasPermission(DbRolePermissions.edit_board_details, board.permissions)) {
    // TOOD: add error log
    return res.sendStatus(403);
  }

  const newMetadata = await updateBoardMetadata({
    uuid,
    // @ts-ignore
    firebaseId: req.currentUser.uid,
    oldMetadata: board,
    newMetadata: { descriptions, settings: { accentColor }, tagline },
  });

  if (!newMetadata) {
    res.sendStatus(500);
    return;
  }

  await cache().hdel(CacheKeys.BOARD, uuid);
  res.status(200).json(
    processBoardMetadata({
      metadata: newMetadata,
      isLoggedIn: true,
    })
  );
});

/**
 * @openapi
 * /boards/{uuid}/visits:
 *   get:
 *     summary: Sets last visited time for board
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
 *         $ref: "#/components/schemas/default500"
 *       200:
 *         description: The visit was successfully registered.
 */
router.post("/:uuid/visits", ensureLoggedIn, async (req, res) => {
  const { uuid } = req.params;
  log(`Setting last visited time for board: ${uuid}`);

  if (
    !(await markBoardVisit({
      firebaseId: req.currentUser.uid,
      uuid,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  log(`Marked last visited time for board: ${uuid}.`);
  res.sendStatus(200);
});

/**
 * @openapi
 * /boards/{uuid}/mute:
 *   post:
 *     summary: Mutes a board.
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
 *           # format: uuid
 *     responses:
 *       401:
 *         $ref: "#/components/schemas/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/schemas/ensureLoggedIn403"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/schemas/default500"
 *       200:
 *         description: The board was successfully muted.
 */
router.post("/:uuid/mute", ensureLoggedIn, async (req, res) => {
  const { uuid } = req.params;

  log(`Setting board muted: ${uuid}`);

  if (
    !(await muteBoard({
      firebaseId: req.currentUser.uid,
      uuid,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  info(`Muted board: ${uuid} for user ${req.currentUser.uid}.`);
  res.status(200).json();
});

/**
 * @openapi
 * /boards/{uuid}/mute:
 *   delete:
 *     summary: Unmutes a board.
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
 *         $ref: "#/components/schemas/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/schemas/ensureLoggedIn403"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/schemas/default500"
 *       200:
 *         description: The board was successfully unmuted.
 *
 */
router.delete("/:uuid/mute", ensureLoggedIn, async (req, res) => {
  const { uuid } = req.params;

  log(`Setting board unmuted: ${uuid}`);

  if (
    !(await unmuteBoard({
      firebaseId: req.currentUser.uid,
      uuid,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  // @ts-ignore
  info(`Unmuted board: ${uuid} for user ${req.currentUser.uid}.`);
  res.status(200).json();
});

/**
 * @openapi
 * /boards/{uuid}/pin:
 *   post:
 *     summary: Pins a board.
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
 *         $ref: "#/components/schemas/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/schemas/ensureLoggedIn403"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/schemas/default500"
 *       200:
 *         description: The board was successfully pinned.
 *
 */
router.post("/:uuid/pin", ensureLoggedIn, async (req, res) => {
  const { uuid } = req.params;

  log(`Setting board pinned: ${uuid}`);

  if (
    !(await pinBoard({
      firebaseId: req.currentUser.uid,
      uuid,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  // @ts-ignore
  info(`Pinned board: ${uuid} for user ${req.currentUser.uid}.`);
  res.status(200).json();
});

/**
 * @openapi
 * /boards/{uuid}/pin:
 *   delete:
 *     summary: Unpins a board.
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
 *           # format: uuid
 *     responses:
 *       401:
 *         $ref: "#/components/schemas/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/schemas/ensureLoggedIn403"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/schemas/default500"
 *       200:
 *         description: The board was successfully unpinned.
 *
 */
router.delete("/:uuid/pin", ensureLoggedIn, async (req, res) => {
  const { uuid } = req.params;

  log(`Setting board unpinned: ${uuid}`);

  if (
    !(await unpinBoard({
      firebaseId: req.currentUser.uid,
      uuid,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  info(`Unpinned board: ${uuid} for user ${req.currentUser?.uid}.`);
  res.status(200).json();
});

/**
 * @openapi
 * /boards/{uuid}/notifications/dismiss:
 *   post:
 *     summary: Dismiss all notifications for board
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
 *           # format: uuid
 *         examples:
 *           existing:
 *             summary: An existing board
 *             value: c6d3d10e-8e49-4d73-b28a-9d652b41beec
 *     responses:
 *       401:
 *         description: User is not logged in.
 *         $ref: "#/components/schemas/default401"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/schemas/default500"
 *       204:
 *         description: Board notifications dismissed.
 */
router.post(
  "/:uuid/notifications/dismiss",
  ensureLoggedIn,
  async (req, res) => {
    const { uuid } = req.params;
    let currentUserId: string = req.currentUser?.uid;
    log(`Dismissing ${uuid} notifications for firebase id: ${currentUserId}`);
    const dismissSuccessful = await dismissBoardNotifications({
      uuid,
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
