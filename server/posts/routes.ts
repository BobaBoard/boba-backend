import debug from "debug";
import express from "express";
import {
  postNewContribution,
  postNewCommentChain,
  getUserPermissionsForPost,
  getPostFromStringId,
  updatePostTags,
} from "./queries";
import { ensureLoggedIn, isLoggedIn } from "../handlers/auth";
import {
  makeServerPost,
  makeServerComment,
  ensureNoIdentityLeakage,
} from "../response-utils";
import { getTagsDelta } from "./utils";
import { canDoTagsEdit } from "../permissions-utils";
import { maybeUpdateSubscriptionsOnThreadChange } from "../subscriptions/utils";

const info = debug("bobaserver:posts:routes-info");
const log = debug("bobaserver:posts:routes-log");
const error = debug("bobaserver:posts:routes-error");

const router = express.Router();

/**
 * @openapi
 * posts/{post_id}/contribute:
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
router.post("/:post_id/contribute", ensureLoggedIn, async (req, res) => {
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
 * posts/{postId}/comment:
 *   post:
 *     summary: Add comments to a contribution, optionally nested under a reply to it.
 *     description: Creates a comment nested under the contribution with id {post_id}.
 *     tags:
 *       - /posts/
 *       - todo
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
 *                   $ref: "#/components/schemas/Comments"
 *                   description: Finalized details of the comments just posted.
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
 * posts/{postId}/edit:
 *   post:
 *     summary: Edits a contribution
 *     description: Edits a contribution (for now just tags).
 *     tags:
 *       - /posts/
 *       - todo
 */
router.post("/:postId/edit", isLoggedIn, async (req, res) => {
  const { postId } = req.params;
  const { whisperTags, indexTags, categoryTags, contentWarnings } = req.body;

  if (!req.currentUser) {
    res.sendStatus(401);
    return;
  }
  const firebaseId = req.currentUser.uid;
  log(`Getting permissions for user ${firebaseId}`);

  const permissions = await getUserPermissionsForPost({
    firebaseId,
    postId,
  });

  log(`Permissions: ${permissions}`);
  if (!permissions) {
    log(`Error while fetching permissions for post ${postId}`);
    res.sendStatus(500);
    return;
  }

  if (!permissions.length) {
    res.sendStatus(401);
    return;
  }

  log(`Getting details from post ${postId}`);
  const postDetails = await getPostFromStringId(null, {
    firebaseId,
    postId,
  });

  const postTags = {
    contentWarnings: postDetails.content_warnings,
    indexTags: postDetails.index_tags,
    categoryTags: postDetails.category_tags,
    whisperTags: postDetails.whisper_tags,
  };

  const newTags = { whisperTags, indexTags, categoryTags, contentWarnings };

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
  log(`Editing post with id ${postId}}`);

  const updatedDetails = await updatePostTags(null, {
    firebaseId,
    postId,
    tagsDelta,
  });
  if (!updatedDetails) {
    log(`Error while updating post ${postId}`);
    res.sendStatus(500);
    return;
  }
  const responsePost = makeServerPost(updatedDetails);

  ensureNoIdentityLeakage(responsePost);
  res.status(220).json(responsePost);
});

export default router;
