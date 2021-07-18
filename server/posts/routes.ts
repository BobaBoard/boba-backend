import debug from "debug";
import express from "express";
import {
  postNewContribution,
  postNewComment,
  postNewCommentChain,
  getUserPermissionsForPost,
  getPostFromStringId,
  updatePostTags,
} from "./queries";
import { isLoggedIn } from "../handlers/auth";
import axios from "axios";
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
 * posts/{postId}/contribute:
 *   post:
 *     summary: Replies to a contribution
 *     description: Posts a contribution replying to the one with id {postId}.
 *     tags:
 *       - /posts/
 *       - todo
 *     parameters:
 *       - name: postId
 *         in: path
 *         description: The uuid of the contribution to reply to.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
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
router.post("/:postId/contribute", isLoggedIn, async (req, res) => {
  const { postId } = req.params;
  const {
    content,
    forceAnonymous,
    large,
    whisperTags,
    indexTags,
    categoryTags,
    contentWarnings,
    accessoryId,
    identityId,
  } = req.body;

  if (!req.currentUser) {
    res.sendStatus(403);
    return;
  }

  log(`Making countribution to post with id ${postId}`);
  log(`Content: `, content);
  log(`Anonymous: `, forceAnonymous);
  log(`Whisper Tags: `, whisperTags);

  const result = await postNewContribution({
    firebaseId: req.currentUser.uid,
    identityId,
    accessoryId,
    parentPostId: postId,
    content,
    isLarge: !!large,
    anonymityType: forceAnonymous ? "everyone" : "strangers",
    whisperTags,
    indexTags,
    categoryTags,
    contentWarnings,
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
 *     summary: Comments on a contribution
 *     description: Posts a comment replying to the contribution with id {postId}.
 *     tags:
 *       - /posts/
 *       - todo
 */
router.post("/:postId/comment", isLoggedIn, async (req, res) => {
  const { postId } = req.params;
  const { content, forceAnonymous, replyToCommentId, identityId, accessoryId } =
    req.body;

  if (!req.currentUser) {
    res.sendStatus(401);
    return;
  }

  log(
    `Making comment to post with id ${postId} replying to ${replyToCommentId}`
  );
  log(`Content: `, content);
  log(`Anonymous: `, forceAnonymous);

  const comment = await postNewComment({
    firebaseId: req.currentUser.uid,
    parentPostId: postId,
    parentCommentId: replyToCommentId,
    content,
    anonymityType: forceAnonymous ? "everyone" : "strangers",
    identityId,
    accessoryId,
  });
  log(`Comment posted: `, comment);

  if (!comment) {
    res.sendStatus(500);
    return;
  }

  const responseComment = makeServerComment(comment);

  ensureNoIdentityLeakage(responseComment);
  res.status(200).json({ comment: responseComment });
});

/**
 * @openapi
 * posts/{postId}/comment/chain:
 *   post:
 *     summary: Comments on a contribution (with a chain)
 *     description: Posts a contribution replying to the one with id {postId}.
 *     tags:
 *       - /posts/
 *       - todo
 */
router.post("/:postId/comment/chain", isLoggedIn, async (req, res) => {
  const { postId } = req.params;
  const { contentArray, forceAnonymous, replyToCommentId, identityId } =
    req.body;

  if (!req.currentUser) {
    res.sendStatus(401);
    return;
  }

  log(
    `Making chained comment to post with id ${postId} replying to ${replyToCommentId}`
  );
  log(`Content: `, contentArray);
  log(`Anonymous: `, forceAnonymous);

  const comments = await postNewCommentChain({
    firebaseId: req.currentUser.uid,
    parentPostId: postId,
    parentCommentId: replyToCommentId,
    contentArray,
    anonymityType: forceAnonymous ? "everyone" : "strangers",
    identityId,
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
