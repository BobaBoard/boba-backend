import { BadRequest400Error, NotFound404Error } from "types/errors/api";
import {
  ensureNoIdentityLeakage,
  makeServerThreadSummary,
} from "utils/response-utils";
import {
  getBoardActivityByExternalId,
  getUserActivity,
  getUserStarFeed,
} from "./queries";

import { Feed } from "types/rest/threads";
import { ZodFeed } from "types/rest/zodthreads";
import debug from "debug";
import { ensureBoardAccess } from "handlers/permissions";
import { ensureLoggedIn } from "handlers/auth";
import express from "express";

const info = debug("bobaserver:feeds:routes-info");
const log = debug("bobaserver:feeds:routes");

const router = express.Router();

/**
 * @openapi
 * /feeds/boards/{board_id}:
 *   get:
 *     summary: Get the feed for the given boards' activity.
 *     operationId: getBoardsFeedByExternalId
 *     tags:
 *       - /feeds/
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The id of the board to fetch the activity of.
 *         required: true
 *         schema:
 *           type: string
 *         examples:
 *           gore:
 *             summary: The feed for the gore board.
 *             value: c6d3d10e-8e49-4d73-b28a-9d652b41beec
 *           cursor:
 *             summary: The feed for a board with a cursor (!long).
 *             value: db8dc5b3-5b4a-4bfe-a303-e176c9b00b83
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
 *               cursor:
 *                 $ref: '#/components/examples/FeedBoardCursor'
 */
router.get("/boards/:board_id", ensureBoardAccess, async (req, res) => {
  const { board_id: boardExternalId } = req.params;
  const { cursor, categoryFilter } = req.query;
  log(
    `Fetching activity data for board with slug ${boardExternalId} with cursor ${cursor} and filtered category "${categoryFilter}"`
  );

  log(cursor);
  const result = await getBoardActivityByExternalId({
    boardExternalId,
    firebaseId: req.currentUser?.uid || null,
    categoryFilter: (categoryFilter as string) || null,
    cursor: (cursor as string) || null,
  });
  info(`Found activity for board ${boardExternalId}:`, result);

  if (result === false) {
    res.sendStatus(500);
    return;
  }
  if (!result) {
    throw new NotFound404Error(
      `Board with id ${boardExternalId} was not found`
    );
  }
  if (!result.activity.length) {
    res.sendStatus(204);
    return;
  }

  const threadsWithIdentity = result.activity.map(makeServerThreadSummary);
  const response: ZodFeed = {
    cursor: {
      next: result.cursor,
    },
    activity: threadsWithIdentity,
  };

  response.activity.map((post) => ensureNoIdentityLeakage(post));
  log(
    `Returning board activity data for board ${boardExternalId} for user ${req.currentUser?.uid}.`
  );
  res.status(200).json(response);
});

/**
 * @openapi
 * /feeds/users/@me:
 *   get:
 *     summary: Get the feed for the current user activity activity.
 *     operationId: getPersonalFeed
 *     tags:
 *       - /feeds/
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
  const { cursor, showRead, ownOnly, realmId: realmExternalId } = req.query;
  const currentUserId: string = req.currentUser!.uid;

  if (!realmExternalId) {
    throw new BadRequest400Error(`Expected realm id in personal feed query.`);
  }

  const userActivity = await getUserActivity({
    firebaseId: currentUserId,
    cursor: (cursor as string) || null,
    realmExternalId: realmExternalId as string,
    updatedOnly: showRead !== "true",
    ownOnly: ownOnly === "true",
  });

  if (!userActivity) {
    throw new NotFound404Error(`User with id ${currentUserId} was not found`);
  }
  if (!userActivity.activity.length) {
    res.sendStatus(204);
    return;
  }

  const threadsWithIdentity = userActivity.activity.map(
    makeServerThreadSummary
  );
  const response: Feed = {
    cursor: {
      next: userActivity.cursor,
    },
    activity: threadsWithIdentity,
  };

  response.activity.map((post) => ensureNoIdentityLeakage(post));
  res.status(200).json(response);
});

/**
 * @openapi
 * /feeds/users/@me/stars:
 *   get:
 *     summary: Get current users Star Feed.
 *     operationId: getUserStarFeed
 *     tags:
 *       - /feeds/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: cursor
 *         in: query
 *         description: The cursor to start feeding the activity of the user star feed from.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Star Feed activity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/FeedActivity"
 */

router.get("/users/@me/stars", ensureLoggedIn, async (req, res) => {
  const { cursor, starred } = req.query;
  const currentUserId: string = req.currentUser!.uid;

  const userStarFeed = await getUserStarFeed({
    firebaseId: currentUserId,
    cursor: (cursor as string) || null,
  });

  const threadsStarred = userStarFeed.activity.map(makeServerThreadSummary);
  const response: Feed = {
    cursor: {
      next: userStarFeed.cursor,
    },
    activity: threadsStarred,
  };

  response.activity.map((post) => ensureNoIdentityLeakage(post));
  res.status(200).json(response);
});

export default router;
