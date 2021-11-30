import { canAccessBoard, canAccessBoardByUuid } from "utils/permissions-utils";
import {
  ensureNoIdentityLeakage,
  makeServerThread,
} from "utils/response-utils";
import {
  ensureThreadAccess,
  ensureThreadPermission,
  withThreadPermissions,
} from "handlers/permissions";
import {
  hideThread,
  markThreadVisit,
  muteThread,
  unhideThread,
  unmuteThread,
  updateThreadView,
} from "./queries";

import { ThreadPermissions } from "types/permissions";
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
 * /threads/{thread_id}:
 *   patch:
 *     summary: Update thread properties.
 *     operationId: updateThreadStringId
 *     description: Updates the default view that the thread uses or the parent board of the thread.
 *     tags:
 *       - /threads/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: thread_id
 *         in: path
 *         description: The id of the thread whose properties should be updated.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           updateView:
 *             summary: A thread from the gore board.
 *             value: 29d1b2da-3289-454a-9089-2ed47db4967b
 *           moveThread:
 *             summary: A thread from the gore board.
 *             value: 29d1b2da-3289-454a-9089-2ed47db4967b
 *     requestBody:
 *       description: request body
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              anyOf:
 *                - defaultView:
 *                  type: string
 *                  enum: [thread, gallery, timeline]
 *                - parentBoardId:
 *                  type: string
 *                  format: uuid
 *           examples:
 *             updateView:
 *               defaultView: gallery
 *             moveThread:
 *                parentBoardId: 0e0d1ee6-f996-4415-89c1-c9dc1fe991dc
 *     responses:
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureThreadPermission403"
 *       404:
 *         $ref: "#/components/responses/threadNotFound404"
 *       204:
 *         description: Thread properties successfully changed.
 *         $ref: "#/components/responses/default204"
 */
router.patch(
  "/:thread_id",
  ensureLoggedIn,
  withThreadPermissions,
  async (req, res) => {
    const { thread_id } = req.params;
    const { defaultView, parentBoardId } = req.body;

    if (!defaultView && !parentBoardId) {
      res
        .status(500)
        .json({ message: "Thread update requires a parameter to update" });
      return;
    }

    if (defaultView) {
      if (
        !req.currentThreadPermissions.includes(
          ThreadPermissions.editDefaultView
        )
      ) {
        res.status(403).json({
          message: `User does not have permission to update view for thread with id ${thread_id}.`,
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
    }

    if (parentBoardId) {
      if (
        !req.currentThreadPermissions.includes(ThreadPermissions.moveThread)
      ) {
        res.status(403).json({
          message: `User does not have permission to move thread thread with id ${thread_id}.`,
        });
        return;
      }
      // TODO: add a test for this case
      if (
        !(await canAccessBoardByUuid({
          boardId: parentBoardId,
          firebaseId: req.currentUser.uid,
        }))
      ) {
        res.status(404).json({
          message: `The board with id \"${parentBoardId}\" was not found.`,
        });
        return;

        // TODO: add case where user can't access board
      }

      if (
        !(await moveThread({
          threadId: thread_id,
          destinationId: parentBoardId,
        }))
      ) {
        return res.sendStatus(500);
      }
    }

    res.sendStatus(204);
  }
);

export default router;
