import {
  createThread,
  getThreadByStringId,
  getTriggeredWebhooks,
  hideThread,
  markThreadVisit,
  muteThread,
  unhideThread,
  unmuteThread,
  updateThreadView,
} from "./queries";
import {
  ensureNoIdentityLeakage,
  makeServerThread,
} from "utils/response-utils";
import {
  ensureThreadAccess,
  ensureThreadPermission,
} from "handlers/permissions";

import { ThreadPermissions } from "types/permissions";
import axios from "axios";
import { canAccessBoard } from "utils/permissions-utils";
import debug from "debug";
import { ensureLoggedIn } from "handlers/auth";
import express from "express";
import { moveThread } from "./queries";

const info = debug("bobaserver:threads:routes-info");
const log = debug("bobaserver:threads:routes-log");

const router = express.Router();

/**
 * @openapi
 * /threads/{thread_id}:
 *   get:
 *     summary: Fetches thread data.
 *     operationId: getThreadByUuid
 *     tags:
 *       - /threads/
 *     security:
 *       - firebase: []
 *       - {}
 *     parameters:
 *       - name: thread_id
 *         in: path
 *         description: The id of the thread to fetch.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           withcommentsthread:
 *             summary: A thread with a comments thread.
 *             value: 8b2646af-2778-487e-8e44-7ae530c2549c
 *     responses:
 *       401:
 *         description: User was not found and thread requires authentication.
 *       403:
 *         description: User is not authorized to fetch this thread.
 *       404:
 *         description: The thread was not found.
 *       200:
 *         description: The thread data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Thread"
 *             examples:
 *               withcommentsthread:
 *                 $ref: '#/components/examples/ThreadWithCommentsThreadResponse'
 */
router.get("/:thread_id", ensureThreadAccess, async (req, res) => {
  const { thread_id: threadId } = req.params;
  log(`Fetching data for thread with id ${threadId}`);

  const serverThread = makeServerThread(req.currentThreadData);
  ensureNoIdentityLeakage(serverThread);

  info(`sending back data for thread ${serverThread.id}.`);
  res.status(200).json(serverThread);
});

router.post("/:thread_id/mute", ensureLoggedIn, async (req, res) => {
  const { thread_id: threadId } = req.params;
  log(`Setting thread muted: ${threadId}`);

  if (
    !(await muteThread({
      firebaseId: req.currentUser.uid,
      threadId,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  info(`Marked last visited time for thread: ${threadId}.`);
  res.status(200).json();
});

router.post(
  "/:thread_id/unmute",
  ensureLoggedIn,
  ensureThreadAccess,
  async (req, res) => {
    const { thread_id: threadId } = req.params;
    log(`Setting thread unmuted: ${threadId}`);

    if (
      !(await unmuteThread({
        firebaseId: req.currentUser.uid,
        threadId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    info(`Marked last visited time for thread: ${threadId}.`);
    res.status(200).json();
  }
);

router.post(
  "/:thread_id/hide",
  ensureLoggedIn,
  ensureThreadAccess,
  async (req, res) => {
    const { thread_id: threadId } = req.params;
    log(`Setting thread hidden: ${threadId}`);

    if (
      !(await hideThread({
        firebaseId: req.currentUser.uid,
        threadId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    info(`Marked last visited time for thread: ${threadId}.`);
    res.status(200).json();
  }
);

router.post(
  "/:thread_id/unhide",
  ensureLoggedIn,
  ensureThreadAccess,
  async (req, res) => {
    const { thread_id: threadId } = req.params;
    log(`Setting thread visible: ${threadId}`);

    if (
      !(await unhideThread({
        firebaseId: req.currentUser.uid,
        threadId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    info(`Marked last visited time for thread: ${threadId}.`);
    res.status(200).json();
  }
);

router.get(
  "/:thread_id/visit",
  ensureLoggedIn,
  ensureThreadAccess,
  async (req, res) => {
    const { thread_id: threadId } = req.params;
    log(`Setting last visited time for thread: ${threadId}`);

    if (
      !(await markThreadVisit({
        firebaseId: req.currentUser.uid,
        threadId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    info(`Marked last visited time for thread: ${threadId}.`);
    res.status(200).json();
  }
);

router.post("/:boardSlug/create", ensureLoggedIn, async (req, res, next) => {
  const { boardSlug } = req.params;
  log(`Creating thread in board with slug ${boardSlug}`);
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
    boardSlug: boardSlug,
    whisperTags,
    indexTags,
    categoryTags,
    contentWarnings,
    identityId,
    accessoryId,
  });
  info(`Created new thread`, threadStringId);

  if (threadStringId === false) {
    res.sendStatus(500);
    return;
  }

  const thread = await getThreadByStringId({
    threadId: threadStringId as string,
    // @ts-ignore
    firebaseId: req.currentUser?.uid,
  });
  info(`Found thread: `, thread);

  if (thread === false) {
    res.sendStatus(500);
    return;
  }
  if (!thread) {
    res.sendStatus(404);
    return;
  }

  const serverThread = makeServerThread(thread);
  ensureNoIdentityLeakage(serverThread);

  info(`sending back data for thread ${threadStringId}.`);
  res.status(200).json(serverThread);

  const webhooks = await getTriggeredWebhooks({
    slug: boardSlug,
    categories: serverThread.posts[0].tags?.category_tags,
  });
  if (webhooks && webhooks.length > 0) {
    const threadUrl = `https://v0.boba.social/!${boardSlug}/thread/${threadStringId}`;
    webhooks.forEach(({ webhook, subscriptionNames }) => {
      const message = `Your "${subscriptionNames.join(
        ", "
      )}" subscription has updated!\n ${threadUrl}`;
      axios.post(webhook, {
        content: message,
        username: serverThread.posts[0].secret_identity.name,
        avatar_url: serverThread.posts[0].secret_identity.avatar,
      });
    });
  }
});

router.post(
  "/:thread_id/update/view",
  ensureLoggedIn,
  ensureThreadPermission(ThreadPermissions.editDefaultView),
  async (req, res) => {
    const { thread_id } = req.params;
    const { defaultView } = req.body;

    if (!defaultView) {
      res.send(500).json({
        message: "Missing default view in thread view update request.",
      });
      return;
    }

    if (
      !(await updateThreadView({
        threadId: thread_id,
        defaultView,
      }))
    ) {
      return res.sendStatus(500);
    }

    res.sendStatus(200);
  }
);

router.post(
  "/:thread_id/move",
  ensureLoggedIn,
  ensureThreadPermission(ThreadPermissions.moveThread),
  async (req, res) => {
    const { thread_id } = req.params;
    const { destinationSlug } = req.body;

    // TODO: add a test for this case
    if (
      !(await canAccessBoard({
        slug: destinationSlug,
        firebaseId: req.currentUser.uid,
      }))
    ) {
      res.status(403).json({ message: "Cannot access destination board" });
      return;
    }

    if (
      !(await moveThread({
        threadId: thread_id,
        destinationSlug,
      }))
    ) {
      return res.sendStatus(500);
    }

    res.sendStatus(204);
  }
);

export default router;
