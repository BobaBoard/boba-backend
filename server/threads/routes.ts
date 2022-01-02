import {
  BadRequest400Error,
  Forbidden403Error,
  NotFound404Error,
} from "types/errors/api";
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
  muteThread,
  starThread,
  unhideThread,
  unmuteThread,
  unstarThread,
  markThreadVisit,
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               defaultView:
 *                 description: The default view that the thread should use.
 *                 type: string
 *                 enum: [thread, gallery, timeline]
 *               parentBoardId:
 *                 description: The id of the board that the thread should be moved to.
 *                 type: string
 *                 format: uuid
 *           examples:
 *             updateView:
 *               value:
 *                 defaultView: gallery
 *             moveThread:
 *               value:
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
      throw new BadRequest400Error(
        "Thread update requires a parameter to update"
      );
    }

    if (defaultView) {
      if (
        !req.currentThreadPermissions.includes(
          ThreadPermissions.editDefaultView
        )
      ) {
        throw new Forbidden403Error(
          `User does not have permission to update view for thread with id ${thread_id}.`
        );
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
        throw new Forbidden403Error(
          `User does not have permission to move thread thread with id ${thread_id}.`
        );
      }
      // TODO: add a test for this case once there's boards that are not accessible to everyone.
      if (
        !(await canAccessBoardByUuid({
          boardId: parentBoardId,
          firebaseId: req.currentUser.uid,
        }))
      ) {
        throw new NotFound404Error(
          `The board with id \"${parentBoardId}\" was not found.`
        );

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

/**
 * @openapi
 * threads/{thread_id}/stars:
 *   post:
 *     summary: Adds thread to Star Feed
 *     description: Adds selected thread to current user Star Feed.
 *     tags:
 *       - /threads/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: threadId
 *         in: path
 *         description: The id of the thread to fetch.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       204:
 *         description: Thread added to Star Feed successfully.
 */

router.post("/:threadId/stars", ensureLoggedIn, async (req, res) => {
  const { threadId } = req.params;

  if (
    !(await starThread({
      firebaseId: req.currentUser.uid,
      threadId,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  info(`Thread ${threadId} added to starfeed of user ${req.currentUser.uid}.`);
  res.status(204).json();
});

/**
 * @openapi
 * threads/{thread_id}/stars:
 *   delete:
 *     summary: Removes thread from Star Feed
 *     description: Deletes selected thread from current user Star Feed.
 *     tags:
 *       - /threads/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: threadId
 *         in: path
 *         description: The id of the thread to fetch.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       204:
 *         description: Thread removed from Star Feed successfully.
 */

router.delete("/:threadId/stars", ensureLoggedIn, async (req, res) => {
  const { threadId } = req.params;

  if (
    !(await unstarThread({
      firebaseId: req.currentUser.uid,
      threadId,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  info(`Thread ${threadId} removed from starfeed of user ${req.currentUser.uid}.`);
  res.status(204).json();
});

export default router;
