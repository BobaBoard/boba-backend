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
 *     operationId: getThreadByStringId
 *     description: Fetches data for the specified thread.
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
 *         $ref: "#/components/responses/threadNotFound404"
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

/**
 * @openapi
 * /threads/{thread_id}/mute:
 *   post:
 *     summary: Mutes a thread.
 *     operationId: muteThreadByStringId
 *     description: Mutes the specified thread for the current user.
 *     tags:
 *       - /threads/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: thread_id
 *         in: path
 *         description: The id of the thread to mute.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           goreThreadId:
 *             summary: A thread from the gore board.
 *             value: 29d1b2da-3289-454a-9089-2ed47db4967b
 *     responses:
 *       401:
 *         description: No authenticated user found.
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         description: Authentication token expired.
 *         $ref: "#/components/responses/ensureLoggedIn403"
 *         # Note: can a user mute a thread they don't have access to?
 *       404:
 *         description: Thread not found. 
 *         # TODO If a thread can't be found, returns 500
 *       200:
 *         description: The thread was succesfully muted.
 */
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

/**
 * @openapi
 * /threads/{thread_id}/mute:
 *   delete:
 *     summary: Unmutes a thread.
 *     operationId: unmuteThreadByStringId
 *     description: Unmutes a specified thread.
 *     tags:
 *       - /threads/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: thread_id
 *         in: path
 *         description: The id of the thread to unmute.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           goreThreadId:
 *             summary: A thread from the gore board.
 *             value: 29d1b2da-3289-454a-9089-2ed47db4967b
 *     responses:
 *       401:
 *         description: No authenticated user found.
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         description: Authentication token expired.
 *         # Note: can a user unmute a thread they don't have access to?
 *         $ref: "#/components/responses/ensureLoggedIn403"
 *       404:
 *         description: Thread not found.
 *         $ref: "#/components/responses/threadNotFound404"
 *       200:
 *         description: The thread was successfully unmuted.
 */
router.delete(
  "/:thread_id/mute",
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

/**
 * @openapi
 * /threads/{thread_id}/hide:
 *   post:
 *     summary: Hides a thread.
 *     operationId: hideThreadByStringId
 *     description: Hides the specified thread for the current user.
 *     tags:
 *       - /threads/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: thread_id
 *         in: path
 *         description: The id of the thread to unhide.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           goreThreadId:
 *             summary: A thread from the gore board.
 *             value: 29d1b2da-3289-454a-9089-2ed47db4967b
 *     responses:
 *       401:
 *         description: No authenticated user found.
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         description: Authentication token expired.
 *         $ref: "#/components/responses/ensureLoggedIn403"
 *         # Note: can a user mute a thread they don't have access to?
 *       404:
 *         description: Thread not found. 
 *         $ref: "#/components/responses/threadNotFound404"
 *       200:
 *         description: The thread was succesfully hidden.
 */
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

/**
 * @openapi
 * /threads/{thread_id}/hide:
 *   delete:
 *     summary: Unhides a thread.
 *     operationId: hideThreadByStringId
 *     description: Unhides the specified thread for the current user.
 *     tags:
 *       - /threads/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: thread_id
 *         in: path
 *         description: The id of the thread to unhide.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           goreThreadId:
 *             summary: A thread from the gore board.
 *             value: 29d1b2da-3289-454a-9089-2ed47db4967b
 *     responses:
 *       401:
 *         description: No authenticated user found.
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         description: Authentication token expired.
 *         $ref: "#/components/responses/ensureLoggedIn403"
 *         # Note: can a user mute a thread they don't have access to?
 *       404:
 *         description: Thread not found. 
 *         $ref: "#/components/responses/threadNotFound404"
 *       200:
 *         description: The thread was succesfully unhidden.
 */
router.delete(
  "/:thread_id/hide",
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

/**
 * @openapi
 * /threads/{thread_id}/visit:
 *   # Note: Should this be POST rather than GET?
 *   get:
 *     summary: Records a visit to a thread by the current user.
 *     operationId: visitThreadByStringId
 *     description: Records a visit to a thread by the current user.
 *     tags:
 *       - /threads/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: thread_id
 *         in: path
 *         description: The id of the thread that is being visited.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           goreThreadId:
 *             summary: A thread from the gore board.
 *             value: 29d1b2da-3289-454a-9089-2ed47db4967b
 *     responses:
 *       401:
 *         description: 
 *         $ref: "#/components/responses/ensureBoardAccess"
 *       403:
 *         description: Authentication token expired.
 *         $ref: "#/components/responses/ensureLoggedIn403"
 *       404:
 *         description: Thread not found. 
 *         $ref: "#/components/responses/threadNotFound404"
 *       200:
 *         description: Thread has been marked as visited.
 */
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

/**
 * @openapi
 * /threads/{board_slug}/create:
 *   post:
 *     summary: Create a new thread.
 *     operationId: 
 *     description: Creates a new thread in the specified board.
 *     tags:
 *       - /threads/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: board_slug
 *         in: path
 *         description: The slug specifying which board the thread should be created in.
 *         required: true
 *         schema:
 *           type: string
 *         examples:
 *           goreBoardSlug:
 *             summary: The slug for the gore board
 *             value: gore
 *     responses:
 *       401:
 *         description: No authenticated user found.
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         description: Authentication token expired.
 *         $ref: "#/components/responses/ensureLoggedIn403"
 *       404:
 *         description: Thread not found. 
 *         $ref: "#/components/responses/threadNotFound404"
 *       200:
 *         description: Thread has been marked as visited.
 */
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

/**
 * @openapi
 * /threads/{thread_id}/update/view:
 *   post:
 *     summary: Update thread view
 *     operationId: 
 *     description:
 *     tags:
 *       - /threads/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: thread_id
 *         in: path
 *         description: The id of the thread whose view should be updated
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           goreThreadId:
 *             summary: 
 *             value: 
 *     responses:
 *       401:
 *         description: 
 *       403:
 *         description: 
 *       404:
 *         description: 
 *       200:
 *         description: 
 *         content:
 *           application/json:
 *             schema:
 *               $ref: 
 *             examples:
 *               <FILL-IN>:
 *                 $ref: 
 */
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

/**
 * @openapi
 * /threads/{thread_id}/move:
 *   post:
 *     summary: Move the thread to another board
 *     operationId: 
 *     description:
 *     tags:
 *       - /threads/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: thread_id
 *         in: path
 *         description: The id of the thread to be moved.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           goreThreadId:
 *             summary: 
 *             value: 
 *     responses:
 *       401:
 *         description: 
 *       403:
 *         description: 
 *       404:
 *         description: 
 *       200:
 *         description: 
 *         content:
 *           application/json:
 *             schema:
 *               $ref: 
 *             examples:
 *               <FILL-IN>:
 *                 $ref: 
 */
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
