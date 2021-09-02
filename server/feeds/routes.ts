import express from "express";
import { getUserActivity, getBoardActivityBySlug } from "./queries";
import { isLoggedIn } from "../../handlers/auth";
import {
  mergeObjectIdentity,
  ensureNoIdentityLeakage,
} from "../../utils/response-utils";
import {
  DbActivityThreadType,
  ServerActivityType,
  ServerThreadSummaryType,
  ServerThreadType,
} from "../../Types";
import { canAccessBoard } from "../../utils/permissions-utils";

import debug from "debug";
const info = debug("bobaserver:feeds:routes-info");
const log = debug("bobaserver:feeds:routes");

const router = express.Router();

/**
 * @openapi
 * /feeds/boards/{slug}:
 *   get:
 *     summary: Get the feed for the given boards' activity.
 *     tags:
 *       - /feeds/
 *       - todo
 *     parameters:
 *       - name: slug
 *         in: path
 *         description: The slug of the board to fetch the activity of.
 *         required: true
 *         schema:
 *           type: string
 *         examples:
 *           gore:
 *             summary: The feed for the gore board.
 *             value: gore
 *           cursor:
 *             summary: The feed for a board with a cursor.
 *             value: long
 *       - name: cursor
 *         in: query
 *         description: The cursor to start feeding the activity of the board from.
 *         schema:
 *           type: string
 *         allowEmptyValue: true
 *         examples:
 *           gore:
 *             summary: The feed for the gore board.
 *             value: ""
 *           cursor:
 *             summary: The feed for a board with a cursor.
 *             value: eyJsYXN0X2FjdGl2aXR5X2N1cnNvciI6IjIwMjAtMDQtMTVUMDU6NDI6MDAuMDAwMDAwIiwicGFnZV9zaXplIjoxMH0=
 *     responses:
 *       404:
 *         description: The board was not found.
 *       200:
 *         description: The board activity.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/FeedActivity"
 *             examples:
 *               gore:
 *                 $ref: '#/components/examples/FeedBoardGore'
 */
router.get("/boards/:slug", isLoggedIn, async (req, res) => {
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
    (thread): ServerThreadSummaryType => {
      const threadWithIdentity =
        mergeObjectIdentity<DbActivityThreadType>(thread);
      return {
        starter: {
          id: threadWithIdentity.post_id,
          parent_thread_id: threadWithIdentity.thread_id,
          parent_post_id: threadWithIdentity.parent_post_id,
          secret_identity: threadWithIdentity.secret_identity,
          user_identity: threadWithIdentity.user_identity,
          accessory_avatar: threadWithIdentity.accessory_avatar,
          friend: threadWithIdentity.friend,
          created_at: threadWithIdentity.created,
          content: threadWithIdentity.content,
          tags: {
            whisper_tags: threadWithIdentity.whisper_tags,
            index_tags: threadWithIdentity.index_tags,
            category_tags: threadWithIdentity.category_tags,
            content_warnings: threadWithIdentity.content_warnings,
          },
          total_comments_amount: threadWithIdentity.comments_amount,
          new_comments_amount: threadWithIdentity.new_comments_amount,
          new: threadWithIdentity.is_new,
          own: threadWithIdentity.self,
        },
        default_view: threadWithIdentity.default_view,
        id: threadWithIdentity.thread_id,
        parent_board_slug: slug,
        new_posts_amount: threadWithIdentity.new_posts_amount,
        new_comments_amount: threadWithIdentity.new_comments_amount,
        total_comments_amount: threadWithIdentity.comments_amount,
        total_posts_amount: threadWithIdentity.posts_amount,
        last_activity_at: threadWithIdentity.thread_last_activity,
        direct_threads_amount: threadWithIdentity.threads_amount,
        muted: threadWithIdentity.muted,
        hidden: threadWithIdentity.hidden,
        new: threadWithIdentity.is_new,
      };
    }
  );
  const response: ServerActivityType = {
    cursor: {
      next: result.cursor,
    },
    activity: threadsWithIdentity,
  };

  response.activity.map((post) => ensureNoIdentityLeakage(post));
  log(
    `Returning board activity data for board ${slug} for user ${req.currentUser?.uid}.`
  );
  res.status(200).json(response);
});

/**
 * @openapi
 * /feeds/users/@me:
 *   get:
 *     summary: Get the feed for the current user activity activity.
 *     tags:
 *       - /feeds/
 *       - todo
 *     parameters:
 *       - name: cursor
 *         in: query
 *         description: The cursor to start feeding the activity of the board from.
 *         schema:
 *           type: string
 *     responses:
 *       404:
 *         description: The board was not found.
 *       200:
 *         description: The board activity.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/FeedActivity"
 */
router.get("/users/@me", isLoggedIn, async (req, res) => {
  const { cursor, updatedOnly, ownOnly } = req.query;
  let currentUserId: string = req.currentUser?.uid;
  if (!currentUserId) {
    res.sendStatus(401);
    return;
  }
  const userActivity = await getUserActivity({
    firebaseId: currentUserId,
    cursor: (cursor as string) || null,
    updatedOnly: updatedOnly === "true",
    ownOnly: ownOnly === "true",
  });

  if (!userActivity) {
    res.sendStatus(404);
    return;
  }
  if (!userActivity.activity.length) {
    res.sendStatus(204);
    return;
  }

  const threadsWithIdentity = userActivity.activity.map(
    (thread): ServerThreadType => {
      const threadWithIdentity =
        mergeObjectIdentity<DbActivityThreadType>(thread);
      return {
        posts: [
          {
            id: threadWithIdentity.post_id,
            parent_thread_id: threadWithIdentity.thread_id,
            parent_post_id: threadWithIdentity.parent_post_id,
            secret_identity: threadWithIdentity.secret_identity,
            user_identity: threadWithIdentity.user_identity,
            accessory_avatar: threadWithIdentity.accessory_avatar,
            own: threadWithIdentity.self,
            friend: threadWithIdentity.friend,
            created_at: threadWithIdentity.created,
            content: threadWithIdentity.content,
            tags: {
              whisper_tags: threadWithIdentity.whisper_tags,
              index_tags: threadWithIdentity.index_tags,
              category_tags: threadWithIdentity.category_tags,
              content_warnings: threadWithIdentity.content_warnings,
            },
            total_comments_amount: threadWithIdentity.comments_amount,
            new_comments_amount: threadWithIdentity.new_comments_amount,
            new: threadWithIdentity.is_new,
          },
        ],
        comments: [] as any,
        starter: {
          id: threadWithIdentity.post_id,
          parent_thread_id: threadWithIdentity.thread_id,
          parent_post_id: threadWithIdentity.parent_post_id,
          secret_identity: threadWithIdentity.secret_identity,
          user_identity: threadWithIdentity.user_identity,
          accessory_avatar: threadWithIdentity.accessory_avatar,
          own: threadWithIdentity.self,
          friend: threadWithIdentity.friend,
          created_at: threadWithIdentity.created,
          content: threadWithIdentity.content,
          tags: {
            whisper_tags: threadWithIdentity.whisper_tags,
            index_tags: threadWithIdentity.index_tags,
            category_tags: threadWithIdentity.category_tags,
            content_warnings: threadWithIdentity.content_warnings,
          },
          total_comments_amount: threadWithIdentity.comments_amount,
          new_comments_amount: threadWithIdentity.new_comments_amount,
          new: threadWithIdentity.is_new,
        },
        default_view: threadWithIdentity.default_view,
        id: threadWithIdentity.thread_id,
        new_posts_amount: threadWithIdentity.new_posts_amount,
        new_comments_amount: threadWithIdentity.new_comments_amount,
        total_comments_amount: threadWithIdentity.comments_amount,
        total_posts_amount: threadWithIdentity.posts_amount,
        last_activity_at: threadWithIdentity.thread_last_activity,
        direct_threads_amount: threadWithIdentity.threads_amount,
        parent_board_slug: threadWithIdentity.board_slug,
        muted: threadWithIdentity.muted,
        hidden: threadWithIdentity.hidden,
        new: threadWithIdentity.is_new,
      };
    }
  );
  const response: {
    next_page_cursor: string;
    activity: ServerThreadType[];
  } = { next_page_cursor: userActivity.cursor, activity: threadsWithIdentity };

  response.activity.map((post) => ensureNoIdentityLeakage(post));
  res.status(200).json(response);
});

export default router;
