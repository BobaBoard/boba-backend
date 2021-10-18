import { CacheKeys, cache } from "server/cache";
import { canAccessBoard, hasPermission } from "utils/permissions-utils";
import {
  dismissBoardNotifications,
  getBoardBySlug,
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
import { getBoardMetadata } from "./utils";
import { processBoardMetadata } from "utils/response-utils";

const info = debug("bobaserver:board:routes-info");
const log = debug("bobaserver:board:routes");

const router = express.Router();

/**
 * @openapi
 * /boards/{slug}:
 *   get:
 *     summary: Fetches board metadata.
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *       - {}
 *     parameters:
 *       - name: slug
 *         in: path
 *         description: The slug of the board to update.
 *         required: true
 *         schema:
 *           type: string
 *           # format: uuid
 *         examples:
 *           existing:
 *             summary: An existing board
 *             value: gore
 *           locked:
 *             summary: A board for logged in users only
 *             value: restricted
 *     responses:
 *       401:
 *         description: User was not found and board requires authentication.
 *       403:
 *         description: User is not authorized to fetch the metadata of this board.
 *       404:
 *         description: The board was not found.
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
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  log(`Fetching data for board with slug ${slug}.`);

  const boardMetadata = await getBoardMetadata({
    firebaseId: req.currentUser?.uid,
    slug,
  });

  if (!canAccessBoard({ slug, firebaseId: req.currentUser?.uid })) {
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

  log(`Returning data for board ${slug} for user ${req.currentUser?.uid}.`);
  res.status(200).json(boardMetadata);
});

/**
 * @openapi
 * /boards/{slug}/metadata/update:
 *   post:
 *     summary: Update boards metadata
 *     tags:
 *       - /boards/
 *       - todo
 */
router.post("/:slug/metadata/update", ensureLoggedIn, async (req, res) => {
  const { slug } = req.params;
  const { descriptions, accentColor, tagline } = req.body;

  const board = await getBoardBySlug({
    firebaseId: req.currentUser?.uid,
    slug,
  });
  log(`Found board`, board);

  if (!board) {
    // TOOD: add error log
    return res.sendStatus(404);
  }

  if (!hasPermission(DbRolePermissions.edit_board_details, board.permissions)) {
    // TOOD: add error log
    return res.sendStatus(403);
  }

  const newMetadata = await updateBoardMetadata({
    slug,
    // @ts-ignore
    firebaseId: req.currentUser.uid,
    oldMetadata: board,
    newMetadata: { descriptions, settings: { accentColor }, tagline },
  });

  if (!newMetadata) {
    res.sendStatus(500);
    return;
  }

  await cache().hdel(CacheKeys.BOARD, slug);
  res.status(200).json(
    processBoardMetadata({
      metadata: newMetadata,
      isLoggedIn: true,
    })
  );
});

/**
 * @openapi
 * /boards/{slug}/visits:
 *   get:
 *     summary: Sets last visited time for board
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *       - {}
 *     parameters:
 *       - name: slug
 *         in: path
 *         description: The slug of the board to update.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       401:
 *         description: User was not found.
 *       200:
 *         description: The visit was successfully registered.
 */
router.post("/:slug/visits", ensureLoggedIn, async (req, res) => {
  const { slug } = req.params;
  log(`Setting last visited time for board: ${slug}`);

  if (
    !(await markBoardVisit({
      firebaseId: req.currentUser.uid,
      slug,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  log(`Marked last visited time for board: ${slug}.`);
  res.sendStatus(200);
});

/**
 * @openapi
 * /boards/{slug}/mute:
 *   post:
 *     summary: Mutes a board.
 *     description: Mutes the specified board for the current user.
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: slug
 *         in: path
 *         description: The name of the board to mute.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       401:
 *         description: User was not found in request that requires authentication.
 *       403:
 *         description: User is not authorized to perform the action.
 *       200:
 *         description: The board was successfully muted.
 */
router.post("/:slug/mute", ensureLoggedIn, async (req, res) => {
  const { slug } = req.params;

  log(`Setting board muted: ${slug}`);

  if (
    !(await muteBoard({
      firebaseId: req.currentUser.uid,
      slug,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  info(`Muted board: ${slug} for user ${req.currentUser.uid}.`);
  res.status(200).json();
});

/**
 * @openapi
 * /boards/{slug}/mute:
 *   delete:
 *     summary: Unmutes a board.
 *     description: Unmutes the specified board for the current user.
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: slug
 *         in: path
 *         description: The name of the board to unmute.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       401:
 *         description: User was not found in request that requires authentication.
 *       403:
 *         description: User is not authorized to perform the action.
 *       200:
 *         description: The board was successfully unmuted.
 *
 */
router.delete("/:slug/mute", ensureLoggedIn, async (req, res) => {
  const { slug } = req.params;

  log(`Setting board unmuted: ${slug}`);

  if (
    !(await unmuteBoard({
      firebaseId: req.currentUser.uid,
      slug,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  // @ts-ignore
  info(`Unmuted board: ${slug} for user ${req.currentUser.uid}.`);
  res.status(200).json();
});

/**
 * @openapi
 * /boards/{slug}/pin:
 *   post:
 *     summary: Pins a board.
 *     description: Pins the specified board for the current user.
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: slug
 *         in: path
 *         description: The name of the board to pin.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       401:
 *         description: User was not found in request that requires authentication.
 *       403:
 *         description: User is not authorized to perform the action.
 *       200:
 *         description: The board was successfully pinned.
 *
 */
router.post("/:slug/pin", ensureLoggedIn, async (req, res) => {
  const { slug } = req.params;

  log(`Setting board pinned: ${slug}`);

  if (
    !(await pinBoard({
      firebaseId: req.currentUser.uid,
      slug,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  // @ts-ignore
  info(`Pinned board: ${slug} for user ${req.currentUser.uid}.`);
  res.status(200).json();
});

/**
 * @openapi
 * /boards/{slug}/pin:
 *   delete:
 *     summary: Unpins a board.
 *     description: Unpins the specified board for the current user.
 *     tags:
 *       - /boards/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: slug
 *         in: path
 *         description: The name of the board to unpin.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       401:
 *         description: User was not found in request that requires authentication.
 *       403:
 *         description: User is not authorized to perform the action.
 *       200:
 *         description: The board was successfully unpinned.
 *
 */
router.delete("/:slug/pin", ensureLoggedIn, async (req, res) => {
  const { slug } = req.params;

  log(`Setting board unpinned: ${slug}`);

  if (
    !(await unpinBoard({
      firebaseId: req.currentUser.uid,
      slug,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  info(`Unpinned board: ${slug} for user ${req.currentUser?.uid}.`);
  res.status(200).json();
});

/**
 * @openapi
 * /boards/{slug}/notifications/dismiss:
 *   post:
 *     summary: Dismiss all notifications for board {slug}
 *     tags:
 *       - /boards/
 *       - todo
 */
router.post(
  "/:slug/notifications/dismiss",
  ensureLoggedIn,
  async (req, res) => {
    const { slug } = req.params;
    let currentUserId: string = req.currentUser.uid;
    log(`Dismissing ${slug} notifications for firebase id: ${currentUserId}`);
    const dismissSuccessful = await dismissBoardNotifications({
      slug,
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
