import {
  BadRequest400Error,
  Forbidden403Error,
  NotFound404Error,
} from "types/errors/api";
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
  starThread,
  unhideThread,
  unmuteThread,
  unstarThread,
  updateThreadView,
} from "./queries";

import { ThreadPermissions } from "types/permissions";
import { canAccessBoardByExternalId } from "utils/permissions-utils";
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
 *     operationId: getThreadByExternalId
 *     description: Fetches data for the specified thread.
 *     tags:
 *       - /threads/
 *       - unzodded
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
  const { thread_id: threadExternalId } = req.params;
  log(`Fetching data for thread with id ${threadExternalId}`);

  const serverThread = makeServerThread(req.currentThreadData!);
  ensureNoIdentityLeakage(serverThread);

  info(`sending back data for thread ${serverThread.id}.`);
  res.status(200).json(serverThread);
});

/**
 * @openapi
 * /threads/{thread_id}/mute:
 *   post:
 *     summary: Mutes a thread.
 *     operationId: muteThreadByExternalId
 *     description: Mutes the specified thread for the current user.
 *     tags:
 *       - /threads/
 *       - unzodded
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
 *           gorethreadExternalId:
 *             summary: A thread from the gore board.
 *             value: 29d1b2da-3289-454a-9089-2ed47db4967b
 *     responses:
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureThreadAccess403"
 *       404:
 *         $ref: "#/components/responses/threadNotFound404"
 *       204:
 *         description: The thread was succesfully muted.
 */
router.post(
  "/:thread_id/mute",
  ensureLoggedIn,
  ensureThreadAccess,
  async (req, res) => {
    const { thread_id: threadExternalId } = req.params;
    log(`Setting thread muted: ${threadExternalId}`);

    if (
      !(await muteThread({
        firebaseId: req.currentUser!.uid,
        threadExternalId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    info(`Marked last visited time for thread: ${threadExternalId}.`);
    res.status(204).json();
  }
);

/**
 * @openapi
 * /threads/{thread_id}/mute:
 *   delete:
 *     summary: Unmutes a thread.
 *     operationId: unmuteThreadByExternalId
 *     description: Unmutes a specified thread.
 *     tags:
 *       - /threads/
 *       - unzodded
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
 *           gorethreadExternalId:
 *             summary: A thread from the gore board.
 *             value: 29d1b2da-3289-454a-9089-2ed47db4967b
 *     responses:
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureThreadAccess403"
 *       404:
 *         $ref: "#/components/responses/threadNotFound404"
 *       204:
 *         description: The thread was successfully unmuted.
 */
router.delete(
  "/:thread_id/mute",
  ensureLoggedIn,
  ensureThreadAccess,
  async (req, res) => {
    const { thread_id: threadExternalId } = req.params;
    log(`Setting thread unmuted: ${threadExternalId}`);

    if (
      !(await unmuteThread({
        firebaseId: req.currentUser!.uid,
        threadExternalId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    info(`Marked last visited time for thread: ${threadExternalId}.`);
    res.status(204).json();
  }
);

/**
 * @openapi
 * /threads/{thread_id}/hide:
 *   post:
 *     summary: Hides a thread.
 *     operationId: hideThreadByExternalId
 *     description: Hides the specified thread for the current user.
 *     tags:
 *       - /threads/
 *       - unzodded
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
 *           gorethreadExternalId:
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
    const { thread_id: threadExternalId } = req.params;
    log(`Setting thread hidden: ${threadExternalId}`);

    if (
      !(await hideThread({
        firebaseId: req.currentUser!.uid,
        threadExternalId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    info(`Marked last visited time for thread: ${threadExternalId}.`);
    res.status(204).json();
  }
);

/**
 * @openapi
 * /threads/{thread_id}/hide:
 *   delete:
 *     summary: Unhides a thread.
 *     operationId: unhideThreadByExternalId
 *     description: Unhides the specified thread for the current user.
 *     tags:
 *       - /threads/
 *       - unzodded
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
 *           gorethreadExternalId:
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
    const { thread_id: threadExternalId } = req.params;
    log(`Setting thread visible: ${threadExternalId}`);

    if (
      !(await unhideThread({
        firebaseId: req.currentUser!.uid,
        threadExternalId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    info(`Marked last visited time for thread: ${threadExternalId}.`);
    res.status(204).json();
  }
);

/**
 * @openapi
 * /threads/{thread_id}/visits:
 *   post:
 *     summary: Records a visit to a thread by the current user.
 *     operationId: visitThreadByExternalId
 *     description: Records a visit to a thread by the current user.
 *     tags:
 *       - /threads/
 *       - unzodded
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
 *           gorethreadExternalId:
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
    const { thread_id: threadExternalId } = req.params;
    log(`Setting last visited time for thread: ${threadExternalId}`);

    if (
      !(await markThreadVisit({
        firebaseId: req.currentUser!.uid,
        threadExternalId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    info(`Marked last visited time for thread: ${threadExternalId}.`);
    res.status(204).json();
  }
);

/**
 * @openapi
 * /threads/{thread_id}:
 *   patch:
 *     summary: Update thread properties.
 *     operationId: updateThreadExternalId
 *     description: Updates the default view that the thread uses or the parent board of the thread.
 *     tags:
 *       - /threads/
 *       - unzodded
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
 *       200:
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
        !req.currentThreadPermissions!.includes(
          ThreadPermissions.editDefaultView
        )
      ) {
        throw new Forbidden403Error(
          `User does not have permission to update view for thread with id ${thread_id}.`
        );
      }

      if (
        !(await updateThreadView({
          threadExternalId: thread_id,
          defaultView,
        }))
      ) {
        return res.sendStatus(500);
      }
    }

    if (parentBoardId) {
      if (
        !req.currentThreadPermissions!.includes(ThreadPermissions.moveThread)
      ) {
        throw new Forbidden403Error(
          `User does not have permission to move thread thread with id ${thread_id}.`
        );
      }
      // TODO: add a test for this case once there's boards that are not accessible to everyone.
      if (
        !(await canAccessBoardByExternalId({
          boardExternalId: parentBoardId,
          firebaseId: req.currentUser!.uid,
        }))
      ) {
        throw new NotFound404Error(
          `The board with id \"${parentBoardId}\" was not found.`
        );

        // TODO: add case where user can't access board
      }

      if (
        !(await moveThread({
          threadExternalId: thread_id,
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
 * /threads/{thread_id}/stars:
 *   post:
 *     summary: Adds thread to Star Feed
 *     operationId: starThreadByExternalId
 *     description: Adds selected thread to current user Star Feed.
 *     tags:
 *       - /threads/
 *       - unzodded
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: thread_id
 *         in: path
 *         description: The id of the thread to star.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureThreadAccess403"
 *       404:
 *         $ref: "#/components/responses/threadNotFound404"
 *       204:
 *         description: Thread added to Star Feed successfully.
 */

router.post(
  "/:thread_id/stars",
  ensureLoggedIn,
  ensureThreadAccess,
  async (req, res) => {
    const { thread_id: threadExternalId } = req.params;
    log(`Adding thread to stars: ${threadExternalId}`);

    if (
      !(await starThread({
        firebaseId: req.currentUser!.uid,
        threadExternalId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    info(`Marked last visited time for thread: ${threadExternalId}.`);
    res.status(204).json();
  }
);

/**
 * @openapi
 * /threads/{thread_id}/stars:
 *   delete:
 *     summary: Removes thread from Star Feed
 *     operationId: unstarThreadByExternalId
 *     description: Deletes selected thread from current user Star Feed.
 *     tags:
 *       - /threads/
 *       - unzodded
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: thread_id
 *         in: path
 *         description: The id of the thread to fetch.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureThreadAccess403"
 *       404:
 *         $ref: "#/components/responses/threadNotFound404"
 *       204:
 *         description: Thread removed from Star Feed successfully.
 */

router.delete(
  "/:thread_id/stars",
  ensureLoggedIn,
  ensureThreadAccess,
  async (req, res) => {
    const { thread_id: threadExternalId } = req.params;
    log(`Removing thread from stars: ${threadExternalId}`);

    if (
      !(await unstarThread({
        firebaseId: req.currentUser!.uid,
        threadExternalId,
      }))
    ) {
      res.sendStatus(500);
      return;
    }

    info(`Marked last visited time for thread: ${threadExternalId}.`);
    res.status(204).json();
  }
);

export default router;
