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
  ensureBoardAccess,
  ensureBoardPermission
} from "handlers/permissions";

import { getBoardMetadataByUuid } from "../boards/utils";

import { ThreadPermissions } from "types/permissions";
import axios from "axios";
import { canAccessBoard, canAccessBoardByUuid } from "utils/permissions-utils";
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
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureThreadAccess403"
 *       404:
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
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureThreadAccess403"
 *       404:
 *         $ref: "#/components/responses/threadNotFound404"
 *       200:
 *         description: The thread was succesfully muted.
 */
router.post(
  "/:thread_id/mute", 
  ensureLoggedIn, 
  ensureThreadAccess, 
  async (req, res) => {
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
  }
);

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
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureThreadAccess403"
 *       404:
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
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureThreadAccess403"
 *       404:
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
 *     operationId: unhideThreadByStringId
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
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureThreadAccess403"
 *       404:
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
 * /threads/{thread_id}/visits:
 *   post:
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
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureThreadAccess403"
 *       404:
 *         $ref: "#/components/responses/threadNotFound404"
 *       200:
 *         description: Thread has been marked as visited.
 */
router.post(
  "/:thread_id/visits",
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
 *     operationId: createThread
 *     description: Creates a new thread in the specified board.
 *     tags:
 *       - /threads/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: board_id
 *         in: path
 *         description: The id for the board in which the thread will be created.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           goreBoardId:
 *             summary: The id for the gore board.
 *             value: c6d3d10e-8e49-4d73-b28a-9d652b41beec
 *     requestBody:
 *       description: request body
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateThread"
 *           examples:
 *             requestBody:
 *               $ref: "#/components/examples/createGoreTestThread"
 *       required: true
 *     responses:
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureBoardPermission403"
 *       404:
 *         $ref: "#/components/responses/threadNotFound404"
 *       200:
 *         description: Thread has been marked as visited.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Thread"
 *             examples:
 *               response:
 *                 $ref: "#/components/examples/createGoreTestThreadResponse"
 */
router.post(
  "/:board_id/create", 
  ensureLoggedIn, 
  ensureBoardAccess,
  //TODO: ensureBoardPermission(BoardPermissions.createThread),
  async (req, res, next) => {
    const { board_id: boardId } = req.params;

    log(`Fetching metadata for board with id ${boardId}`);
    const boardMetadata = await getBoardMetadataByUuid({
      firebaseId: req.currentUser?.uid,
      boardId,
    });
    const boardSlug = boardMetadata.slug;

    log(`Creating thread in board with id ${boardId}`);
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
      boardStringId: boardId,
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

    info(`generating webhook for thread ${threadStringId} in board ${boardSlug}`);

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
  }
);

/**
 * @openapi
 * /threads/{thread_id}/update/view:
 *   post:
 *     summary: Update default thread view.
 *     operationId: updateThreadViewByStringId
 *     description: Updates the default view that the thread uses.
 *     tags:
 *       - /threads/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: thread_id
 *         in: path
 *         description: The id of the thread whose default view should be updated.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           goreThreadId:
 *             summary: A thread from the gore board.
 *             value: 29d1b2da-3289-454a-9089-2ed47db4967b
 *     requestBody:
 *       description: request body
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: 
 *               defaultView:
 *                 type: string
 *                 enum: [thread, gallery, timeline]
 *             required: 
 *               - defaultView
 *           example:
 *             defaultView: gallery
 *     responses:
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureThreadPermission403"
 *       404:
 *         $ref: "#/components/responses/threadNotFound404"
 *       200:
 *         description: Default thread view changed.
 *         $ref: "#/components/responses/default200"
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
 *     summary: Move a thread to another board.
 *     operationId: moveThread
 *     description: Moves the specified thread to the specified board.
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
 *             summary: A thread from the gore board.
 *             value: 29d1b2da-3289-454a-9089-2ed47db4967b
 *     requestBody:
 *       description: request body
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: 
 *               destinationId:
 *                 type: string
 *                 format: uuid
 *             required: 
 *               - destinationId
 *           example:
 *             destinationId: 2fb151eb-c600-4fe4-a542-4662487e5496
 *     responses:
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         description: User is unauthorized to perform operation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/genericResponse"
 *             examples:
 *               insufficientThreadPermissions:
 *                 summary: Insufficient thread permissions.
 *                 value: 
 *                   message: User does not have required permissions for thread operation.
 *               insufficientBoardPermissions:
 *                 summary: Insufficient board permissions.
 *                 value: 
 *                   message: User does not have required permissions on destination board.
 *       404:
 *         description: Board or thread was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/genericResponse"
 *             examples:
 *               threadNotFound:
 *                 summary: The specified thread was not found.
 *                 value: 
 *                   message: The thread with id 29d1b2da-3289-454a-9089-2ed47db4967b was not found. 
 *               boardNotFound:
 *                 summary: The destination board was not found.
 *                 value: 
 *                   message: The board with id 2fb151eb-c600-4fe4-a542-4662487e5496 was not found. 
 *       204:
 *         description: Thread successfully moved.
 */
router.post(
  "/:thread_id/move",
  ensureLoggedIn,
  ensureThreadPermission(ThreadPermissions.moveThread),
  //ensureBoardPermission(BoardPermissions.createThread),
  async (req, res) => {
    const { thread_id } = req.params;
    const { destinationId } = req.body;

    // TODO: add a test for this case
    if (
      !(await canAccessBoardByUuid({
        boardId: destinationId,
        firebaseId: req.currentUser.uid,
      }))
    ) {
      res.status(404).json({ message: `The board with id ${destinationId} was not found.` });
      return;
    }

    if (
      !(await moveThread({
        threadId: thread_id,
        destinationId,
      }))
    ) {
      return res.sendStatus(500);
    }

    res.sendStatus(204);
  }
);

export default router;
