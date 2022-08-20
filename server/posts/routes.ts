import * as threadEvents from "handlers/events/threads";

import { BadRequest400Error, Forbidden403Error } from "types/errors/api";
import {
  ensureNoIdentityLeakage,
  makeServerComment,
  makeServerPost,
} from "utils/response-utils";
import {
  ensureRealmPermission,
  ensureThreadAccess,
  withPostPermissions,
} from "handlers/permissions";
import {
  getPostFromStringId,
  postNewCommentChain,
  postNewContribution,
  updatePostTags,
} from "./queries";

import { RealmPermissions } from "types/permissions";
import { canDoTagsEdit } from "utils/permissions-utils";
import debug from "debug";
import { ensureLoggedIn } from "handlers/auth";
import express from "express";
import { getTagsDelta } from "./utils";

const info = debug("bobaserver:posts:routes-info");
const log = debug("bobaserver:posts:routes-log");
const error = debug("bobaserver:posts:routes-error");

const router = express.Router();

/**
 * @openapi
 * /posts/{post_id}/contributions:
 *   post:
 *     summary: Replies to a contribution.
 *     operationId: postContribution
 *     description: Posts a contribution replying to the one with id {postId}.
 *     tags:
 *       - /posts/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: post_id
 *         in: path
 *         description: The uuid of the contribution to reply to.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       description: The details of the contribution to post.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - type: object
 *                 properties:
 *                   content:
 *                     type: string
 *                     format: quill-delta
 *               - $ref: "#/components/schemas/Tags"
 *               - $ref: "#/components/schemas/IdentityParams"
 *             required:
 *               - content
 *     responses:
 *       401:
 *         description: User was not found in request that requires authentication.
 *       403:
 *         description: User is not authorized to perform the action.
 *       200:
 *         description: The contribution was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contribution:
 *                   $ref: "#/components/schemas/Contribution"
 *                   description: Finalized details of the contributions just posted.
 */
router.post(
  "/:post_id/contributions",
  ensureLoggedIn,
  ensureThreadAccess,
  ensureRealmPermission(RealmPermissions.postOnRealm),
  async (req, res) => {
    const { post_id } = req.params;
    const {
      content,
      // TODO: remove
      forceAnonymous,
      // TODO: remove
      large,
      whisper_tags,
      index_tags,
      category_tags,
      content_warnings,
      accessory_id,
      identity_id,
    } = req.body;

    log(`Making countribution to post with id ${post_id}`);

    const result = await postNewContribution({
      firebaseId: req.currentUser.uid,
      identityId: identity_id,
      accessoryId: accessory_id,
      parentPostId: post_id,
      content,
      isLarge: !!large,
      anonymityType: forceAnonymous ? "everyone" : "strangers",
      whisperTags: whisper_tags,
      indexTags: index_tags,
      categoryTags: category_tags,
      contentWarnings: content_warnings,
    });
    log(`Contribution posted: `, result);

    if (!result) {
      res.sendStatus(500);
      return;
    }

    const { contribution, boardSlug } = result;
    const responsePost = makeServerPost(contribution);

    ensureNoIdentityLeakage(responsePost);
    res.status(200).json({ contribution: responsePost });

    threadEvents.emit(threadEvents.EVENT_TYPES.THREAD_UPDATED, {
      boardSlug,
      post: responsePost,
    });
  }
);

/**
 * @openapi
 * /posts/{post_id}/comments:
 *   post:
 *     summary: Add comments to a contribution, optionally nested under another comment.
 *     operationId: postComment
 *     description: Creates a comment nested under the contribution with id {post_id}.
 *     tags:
 *       - /posts/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: post_id
 *         in: path
 *         description: The uuid of the contribution to reply to.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       description: The details of the comment to post.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - type: object
 *                 properties:
 *                   contents:
 *                     type: array
 *                     items:
 *                       $ref: "#/components/schemas/Comment"
 *                   reply_to_comment_id:
 *                     oneOf:
 *                       - type: string
 *                         format: uuid
 *                       - type: "null"
 *               - $ref: "#/components/schemas/IdentityParams"
 *     responses:
 *       401:
 *         description: User was not found in request that requires authentication.
 *       403:
 *         description: User is not authorized to perform the action.
 *       200:
 *         description: The comments were successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   description: Finalized details of the comments just posted.
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Comment"
 */
router.post(
  "/:post_id/comments",
  ensureLoggedIn,
  ensureThreadAccess,
  ensureRealmPermission(RealmPermissions.commentOnRealm),
  async (req, res) => {
    const { post_id } = req.params;
    const {
      contents,
      forceAnonymous,
      reply_to_comment_id,
      identity_id,
      accessory_id,
    } = req.body;

    log(
      `Making chained comment to post with id ${post_id} replying to ${reply_to_comment_id}`
    );

    if (!Array.isArray(contents)) {
      throw new BadRequest400Error(
        `Received non-array type as contents of comments.`
      );
    }

    const comments = await postNewCommentChain({
      firebaseId: req.currentUser.uid,
      parentPostId: post_id,
      parentCommentId: reply_to_comment_id,
      contentArray: contents,
      anonymityType: forceAnonymous ? "everyone" : "strangers",
      identityId: identity_id,
      accessoryId: accessory_id,
    });
    log(`Comments posted: `, comments);

    if (!comments) {
      res.sendStatus(500);
      return;
    }

    const responseComments = comments.map((comment) =>
      makeServerComment(comment)
    );

    responseComments.map((comment) => ensureNoIdentityLeakage(comment));
    res.status(200).json({ comments: responseComments });
  }
);

/**
 * @openapi
 * /posts/{post_id}/contributions:
 *   patch:
 *     summary: Edits a contribution.
 *     operationId: editContribution
 *     description: Edits a contribution (for now just its tags).
 *     tags:
 *       - /posts/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: post_id
 *         in: path
 *         description: The uuid of the contribution to edit.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       description: The details of the contribution to edit.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Tags"
 *     responses:
 *       401:
 *         description: User was not found in request that requires authentication.
 *       403:
 *         description: User is not authorized to perform the action.
 *       200:
 *         description: The contribution was successfully edited.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contribution:
 *                   $ref: "#/components/schemas/Contribution"
 *                   description: Finalized details of the contributions just edited.
 */
router.patch(
  "/:post_id/contributions",
  ensureLoggedIn,
  withPostPermissions,
  async (req, res) => {
    const { post_id } = req.params;
    const { whisper_tags, index_tags, category_tags, content_warnings } =
      req.body;

    const firebaseId = req.currentUser.uid;
    log(`Getting post permissions for user ${firebaseId}`);

    log(`Getting details from post ${post_id}`);
    const postDetails = await getPostFromStringId(null, {
      firebaseId,
      postId: post_id,
    });

    const postTags = {
      contentWarnings: postDetails.content_warnings,
      indexTags: postDetails.index_tags,
      categoryTags: postDetails.category_tags,
      whisperTags: postDetails.whisper_tags,
    };

    const newTags = {
      whisperTags: whisper_tags,
      indexTags: index_tags,
      categoryTags: category_tags,
      contentWarnings: content_warnings,
    };

    const tagsDelta = getTagsDelta({ oldTags: postTags, newTags });
    info(
      "Attempting tags edit of delta %O with permissions %O",
      tagsDelta,
      req.currentPostPermissions
    );

    if (!canDoTagsEdit(tagsDelta, req.currentPostPermissions)) {
      throw new Forbidden403Error(
        "User is not authorized to edit tags on this post."
      );
    }
    log(`Editing post with id ${post_id}}`);

    const updatedDetails = await updatePostTags(null, {
      firebaseId,
      postId: post_id,
      tagsDelta,
    });
    if (!updatedDetails) {
      log(`Error while updating post ${post_id}`);
      res.sendStatus(500);
      return;
    }
    const responsePost = makeServerPost(updatedDetails);
    // TODO: [realms] remove comments from makeServerPost
    // @ts-expect-error
    delete responsePost.comments;

    ensureNoIdentityLeakage(responsePost);
    res.status(200).json(responsePost);
  }
);

export default router;
