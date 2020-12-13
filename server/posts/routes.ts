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
import { isLoggedIn } from "../auth-handler";
import axios from "axios";
import {
  makeServerPost,
  makeServerComment,
  ensureNoIdentityLeakage,
} from "../response-utils";
import { getTagsDelta } from "./utils";
import { canDoTagsEdit } from "../permissions-utils";

const info = debug("bobaserver:posts:routes-info");
const log = debug("bobaserver:posts:routes-log");
const error = debug("bobaserver:posts:routes-error");

const router = express.Router();

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
    identityId,
  } = req.body;

  // @ts-ignore
  if (!req.currentUser) {
    res.sendStatus(403);
    return;
  }

  log(`Making countribution to post with id ${postId}`);
  log(`Content: `, content);
  log(`Anonymous: `, forceAnonymous);
  log(`Whisper Tags: `, whisperTags);

  const post = await postNewContribution({
    // @ts-ignore
    firebaseId: req.currentUser.uid,
    identityId,
    parentPostId: postId,
    content,
    isLarge: !!large,
    anonymityType: forceAnonymous ? "everyone" : "strangers",
    whisperTags,
    indexTags,
    categoryTags,
    contentWarnings,
  });
  log(`Contribution posted: `, post);

  if (!post) {
    res.sendStatus(500);
    return;
  }

  const responsePost = makeServerPost(post);

  ensureNoIdentityLeakage(responsePost);
  res.status(200).json({ contribution: responsePost });
});

router.post("/:postId/comment", isLoggedIn, async (req, res) => {
  const { postId } = req.params;
  const { content, forceAnonymous, replyToCommentId, identityId } = req.body;

  // @ts-ignore
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
    // @ts-ignore
    firebaseId: req.currentUser.uid,
    parentPostId: postId,
    parentCommentId: replyToCommentId,
    content,
    anonymityType: forceAnonymous ? "everyone" : "strangers",
    identityId,
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

router.post("/:postId/comment/chain", isLoggedIn, async (req, res) => {
  const { postId } = req.params;
  const {
    contentArray,
    forceAnonymous,
    replyToCommentId,
    identityId,
  } = req.body;

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

const EXTRACT_HREF_REGEX = /data-href="([^"]+)"/;
const EXTRACT_DID_REGEX = /data-did="([^"]+)"/;

router.get("/embed/tumblr", isLoggedIn, async (req, res) => {
  const { url } = req.query;

  axios
    .get(`https://www.tumblr.com/oembed/1.0?url=${url}`)
    .then((tumblrRes) => {
      res.status(200).send({
        did: tumblrRes.data.html.match(EXTRACT_DID_REGEX)?.[1],
        href: tumblrRes.data.html.match(EXTRACT_HREF_REGEX)?.[1],
        url,
        embedWidth: tumblrRes.data.width,
      });
    })
    .catch((e) => {
      error(`Error while fetching tumblr embed for ${url}:`);
      error(e);
      res.sendStatus(500);
    });
});

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
