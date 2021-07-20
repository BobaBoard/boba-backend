import debug from "debug";
import express from "express";
import {
  postNewContribution,
  postNewCommentChain,
  getUserPermissionsForPost,
  getPostFromStringId,
  updatePostTags,
} from "./queries";
import { ensureLoggedIn, isLoggedIn } from "../../handlers/auth";
import {
  makeServerPost,
  makeServerComment,
  ensureNoIdentityLeakage,
} from "../../utils/response-utils";
import { getTagsDelta } from "./utils";
import { canDoTagsEdit } from "../../utils/permissions-utils";
import { maybeUpdateSubscriptionsOnThreadChange } from "../subscriptions/utils";

const info = debug("bobaserver:posts:routes-info");
const log = debug("bobaserver:posts:routes-log");
const error = debug("bobaserver:posts:routes-error");

const router = express.Router();

/**
 * @openapi
 * posts/{post_id}/contribution:
 *   post:
 *     summary: Replies to a contribution.
 *     description: Posts a contribution replying to the one with id {postId}.
 *     tags:
 *       - /posts/
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
 *                     required: true
 *                     type: string
 *                     format: quill-delta
 *               - $ref: "#/components/schemas/Tags"
 *               - $ref: "#/components/params/Identity"
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
router.post("/:post_id/contribution", ensureLoggedIn, async (req, res) => {
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

  maybeUpdateSubscriptionsOnThreadChange({
    threadId: responsePost.parent_thread_id,
    postId: responsePost.post_id,
    boardSlug,
    secretIdentity: responsePost.secret_identity,
    categoryNames: responsePost.tags?.category_tags,
  });
});

/**
 * @openapi
 * posts/{post_id}/comment:
 *   post:
 *     summary: Add comments to a contribution, optionally nested under another comment.
 *     description: Creates a comment nested under the contribution with id {post_id}.
 *     tags:
 *       - /posts/
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
 *                     required: true
 *                     type: array
 *                     items:
 *                       $ref: "#/components/schemas/Comment"
 *                   reply_to_comment_id:
 *                     nullable: true
 *                     type: string
 *                     format: uuid
 *               - $ref: "#/components/params/Identity"
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
router.post("/:post_id/comment", ensureLoggedIn, async (req, res) => {
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
    res.status(500).json({
      message: "Received non-array type as contents of comment.",
    });
    return;
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
});

/**
 * @openapi
 * posts/{post_id}/contribution:
 *   patch:
 *     summary: Edits a contribution.
 *     description: Edits a contribution (for now just its tags).
 *     tags:
 *       - /posts/
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
router.patch("/:post_id/contribution", ensureLoggedIn, async (req, res) => {
  const { post_id } = req.params;
  const { whisper_tags, index_tags, category_tags, content_warnings } =
    req.body;

  const firebaseId = req.currentUser.uid;
  log(`Getting post permissions for user ${firebaseId}`);

  const permissions = await getUserPermissionsForPost({
    firebaseId,
    postId: post_id,
  });

  log(`Permissions: ${permissions}`);
  if (!permissions) {
    log(`Error while fetching permissions for post ${post_id}`);
    res.sendStatus(500);
    return;
  }

  if (!permissions.length) {
    res.sendStatus(401);
    return;
  }

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
    permissions
  );
  if (!canDoTagsEdit(tagsDelta, permissions)) {
    res.sendStatus(401);
    return;
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

  ensureNoIdentityLeakage(responsePost);
  res.status(220).json({ contribution: responsePost });
});

export default router;
