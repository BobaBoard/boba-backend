import {
  ensureNoIdentityLeakage,
  makeServerThreadSummary,
} from "utils/response-utils";
import { getBoardActivityBySlug, getUserActivity } from "./queries";

import { ServerFeedType } from "Types";
import { canAccessBoard } from "utils/permissions-utils";
import debug from "debug";
import { ensureLoggedIn } from "handlers/auth";
import express from "express";

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
router.get("/boards/:slug", async (req, res) => {
  const { slug } = req.params;
  const { cursor, categoryFilter } = req.query;
  log(
    `Fetching activity data for board with slug ${slug} with cursor ${cursor} and filtered category "${categoryFilter}"`
  );

  if (!(await canAccessBoard({ slug, firebaseId: req.currentUser?.uid }))) {
    // TOOD: add error log
    // TODO: make it 401 or 403 according to actual token presence.
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

  const threadsWithIdentity = result.activity.map(makeServerThreadSummary);
  const response: ServerFeedType = {
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
 *     security:
 *       - firebase: []
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
router.get("/users/@me", ensureLoggedIn, async (req, res) => {
  const { cursor, showRead, ownOnly } = req.query;
  const currentUserId: string = req.currentUser?.uid;

  const userActivity = await getUserActivity({
    firebaseId: currentUserId,
    cursor: (cursor as string) || null,
    updatedOnly: showRead !== "true",
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
    makeServerThreadSummary
  );
  const response: ServerFeedType = {
    cursor: {
      next: userActivity.cursor,
    },
    activity: threadsWithIdentity,
  };

  response.activity.map((post) => ensureNoIdentityLeakage(post));
  res.status(200).json(response);
});

export default router;
