import debug from "debug";
import express from "express";
import { cache, CacheKeys } from "../cache";
import {
  getBoardBySlug,
  getBoardActivityBySlug,
  getBoards,
  markBoardVisit,
  updateBoardMetadata,
  muteBoard,
  unmuteBoard,
  dismissBoardNotifications,
  pinBoard,
  unpinBoard,
} from "./queries";
import { ensureLoggedIn, isLoggedIn } from "../../handlers/auth";
import {
  mergeObjectIdentity,
  ensureNoIdentityLeakage,
  processBoardMetadata,
  processBoardsMetadata,
} from "../../utils/response-utils";
import { canEditBoard } from "../../utils/permissions-utils";
import { DbActivityThreadType, ServerThreadType } from "../../Types";
import { canAccessBoard, getBoardMetadata } from "./utils";

const info = debug("bobaserver:board:routes-info");
const log = debug("bobaserver:board:routes");

const router = express.Router();

/**
 * @openapi
 * boards/:
 *   get:
 *     summary: Get all boards and their metadata.
 *     tags:
 *       - /boards/
 *       - todo
 */
router.get("/", isLoggedIn, async (req, res) => {
  if (!req.currentUser?.uid) {
    // Only get cache for non-logged in users, because for logged in users this
    // method also returns updates.
    const cachedBoards = await cache().get(CacheKeys.BOARDS);
    if (cachedBoards) {
      info(`Returning cached result for all boards.`);
      res.status(200).json(JSON.parse(cachedBoards));
      return;
    }
  }

  const boards = await getBoards({
    firebaseId: req.currentUser?.uid,
  });
  if (!boards) {
    res.status(500);
  }

  const boardsResponse = processBoardsMetadata({
    boards,
    isLoggedIn: !!req.currentUser?.uid,
  });
  log(`Returning all boards for user ${req.currentUser?.uid}`);
  res.status(200).json(boardsResponse);

  if (!req.currentUser?.uid) {
    cache().set(CacheKeys.BOARDS, JSON.stringify(boardsResponse));
  }
});

/**
 * @openapi
 * boards/{slug}:
 *   get:
 *     summary: Fetches board data.
 *     tags:
 *       - /boards/
 *       - todo
 */
router.get("/:slug", isLoggedIn, async (req, res) => {
  const { slug } = req.params;
  log(`Fetching data for board with slug ${slug}.`);

  if (!req.currentUser?.uid) {
    const cachedBoard = await cache().hget(CacheKeys.BOARD, slug);
    if (cachedBoard) {
      log(`Returning cached data for board ${slug}`);
      return res.status(200).json(JSON.parse(cachedBoard));
    }
  }

  const boardMetadata = await getBoardMetadata({
    firebaseId: req.currentUser?.uid,
    slug,
  });

  if (!boardMetadata) {
    res.sendStatus(404);
    return;
  }

  log(`Returning data for board ${slug} for user ${req.currentUser?.uid}.`);
  res.status(200).json(boardMetadata);
});

/**
 * @openapi
 * boards/{slug}/metadata/update:
 *   post:
 *     summary: Update boards metadata
 *     tags:
 *       - /boards/
 *       - todo
 */
router.post("/:slug/metadata/update", isLoggedIn, async (req, res) => {
  const { slug } = req.params;
  const { descriptions, accentColor, tagline } = req.body;

  // @ts-ignore
  if (!req.currentUser) {
    return res.sendStatus(401);
  }

  const board = await getBoardBySlug({
    // @ts-ignore
    firebaseId: req.currentUser?.uid,
    slug,
  });
  log(`Found board`, board);

  if (!board) {
    // TOOD: add error log
    return res.sendStatus(404);
  }

  if (!canEditBoard(board.permissions)) {
    // TOOD: add error log
    return res.sendStatus(403);
  }

  const newMetadata = await updateBoardMetadata({
    slug,
    // @ts-ignore
    firebaseId: req.currentUser?.uid,
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
      isLoggedIn: !!req.currentUser?.uid,
    })
  );
});

/**
 * @openapi
 * boards/{slug}/visit:
 *   get:
 *     summary: Sets last visited time for board
 *     tags:
 *       - /boards/
 *       - todo
 */
router.get("/:slug/visit", isLoggedIn, async (req, res) => {
  const { slug } = req.params;
  // @ts-ignore
  if (!req.currentUser) {
    // TODO: fix wrong status
    return res.sendStatus(401);
  }
  log(`Setting last visited time for board: ${slug}`);

  if (
    !(await markBoardVisit({
      // @ts-ignore
      firebaseId: req.currentUser.uid,
      slug,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  log(`Marked last visited time for board: ${slug}.`);
  res.status(200).json();
});

/**
 * @openapi
 * boards/{slug}/mute:
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
      // @ts-ignore
      firebaseId: req.currentUser.uid,
      slug,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  // @ts-ignore
  info(`Muted board: ${slug} for user ${req.currentUser.uid}.`);
  res.status(200).json();
});

/**
 * @openapi
 * boards/{slug}/mute:
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
      // @ts-ignore
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
 * boards/{slug}/pin:
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
      // @ts-ignore
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
 * boards/{slug}/pin:
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
      firebaseId: req.currentUser?.uid,
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
 * boards/{slug}/notifications/dismiss:
 *   post:
 *     summary: Dismiss all notifications for board {slug}
 *     tags:
 *       - /boards/
 *       - todo
 */
router.post("/:slug/notifications/dismiss", isLoggedIn, async (req, res) => {
  const { slug } = req.params;
  // @ts-ignore
  let currentUserId: string = req.currentUser?.uid;
  if (!currentUserId) {
    res.sendStatus(401);
    return;
  }
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
});

/**
 * @openapi
 * boards/{slug}/activity/latest:
 *   get:
 *     summary: Get latest board activity.
 *     tags:
 *       - /boards/
 *       - todo
 */
router.get("/:slug/activity/latest", isLoggedIn, async (req, res) => {
  const { slug } = req.params;
  const { cursor, categoryFilter } = req.query;
  log(
    `Fetching activity data for board with slug ${slug} with cursor ${cursor} and filtered category "${categoryFilter}"`
  );

  if (!(await canAccessBoard({ slug, firebaseId: req.currentUser?.uid }))) {
    // TOOD: add error log
    return res.sendStatus(403);
  }

  const result = await getBoardActivityBySlug({
    slug,
    firebaseId: req.currentUser?.uid,
    filterCategory: (categoryFilter as string) || null,
    cursor: (cursor as string) || null,
  });
  info(`Found activity for board ${slug}:`, result);

  if (result === false) {
    res.sendStatus(500);
    return;
  }
  if (!result) {
    res.sendStatus(404);
    return;
  }
  if (!result.activity.length) {
    res.sendStatus(204);
    return;
  }

  const threadsWithIdentity = result.activity.map(
    (thread): ServerThreadType => {
      const threadWithIdentity =
        mergeObjectIdentity<DbActivityThreadType>(thread);
      return {
        posts: [
          {
            post_id: threadWithIdentity.post_id,
            parent_thread_id: threadWithIdentity.thread_id,
            parent_post_id: threadWithIdentity.parent_post_id,
            secret_identity: threadWithIdentity.secret_identity,
            user_identity: threadWithIdentity.user_identity,
            accessory_avatar: threadWithIdentity.accessory_avatar,
            self: threadWithIdentity.self,
            friend: threadWithIdentity.friend,
            created: threadWithIdentity.created,
            content: threadWithIdentity.content,
            options: threadWithIdentity.options,
            tags: {
              whisper_tags: threadWithIdentity.whisper_tags,
              index_tags: threadWithIdentity.index_tags,
              category_tags: threadWithIdentity.category_tags,
              content_warnings: threadWithIdentity.content_warnings,
            },
            total_comments_amount: threadWithIdentity.comments_amount,
            new_comments_amount: threadWithIdentity.new_comments_amount,
            is_new: threadWithIdentity.is_new,
          },
        ],
        default_view: threadWithIdentity.default_view,
        thread_id: threadWithIdentity.thread_id,
        board_slug: slug,
        thread_new_posts_amount: threadWithIdentity.new_posts_amount,
        thread_new_comments_amount: threadWithIdentity.new_comments_amount,
        thread_total_comments_amount: threadWithIdentity.comments_amount,
        thread_total_posts_amount: threadWithIdentity.posts_amount,
        thread_last_activity: threadWithIdentity.thread_last_activity,
        thread_direct_threads_amount: threadWithIdentity.threads_amount,
        muted: threadWithIdentity.muted,
        hidden: threadWithIdentity.hidden,
      };
    }
  );
  const response: {
    next_page_cursor: string;
    activity: ServerThreadType[];
  } = { next_page_cursor: result.cursor, activity: threadsWithIdentity };

  response.activity.map((post) => ensureNoIdentityLeakage(post));
  log(
    `Returning board activity data for board ${slug} for user ${req.currentUser?.uid}.`
  );
  res.status(200).json(response);
});

export default router;
