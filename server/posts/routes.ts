import debug from "debug";
import express from "express";
import { postNewContribution, postNewComment } from "./queries";
import { isLoggedIn } from "../auth-handler";
import axios from "axios";
import { ServerPostType, ServerCommentType } from "../types/Types";
import {
  makeServerPost,
  makeServerComment,
  ensureNoIdentityLeakage,
} from "../response-utils";

const info = debug("bobaserver:posts:routes-info");
const log = debug("bobaserver:posts:routes-log");
const error = debug("bobaserver:posts:routes-error");

const router = express.Router();

router.post("/:postId/contribute", isLoggedIn, async (req, res) => {
  const { postId } = req.params;
  const { content, forceAnonymous, large, whisperTags } = req.body;

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
    parentPostId: postId,
    content,
    isLarge: !!large,
    anonymityType: forceAnonymous ? "everyone" : "strangers",
    whisperTags,
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
  const { content, forceAnonymous } = req.body;

  // @ts-ignore
  if (!req.currentUser) {
    res.sendStatus(403);
    return;
  }

  log(`Making comment to post with id ${postId}`);
  log(`Content: `, content);
  log(`Anonymous: `, forceAnonymous);

  const comment = await postNewComment({
    // @ts-ignore
    firebaseId: req.currentUser.uid,
    parentPostId: postId,
    content,
    anonymityType: forceAnonymous ? "everyone" : "strangers",
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

const EXTRACT_HREF_REGEX = /data-href="([^"]+)"/;
const EXTRACT_DID_REGEX = /data-did="([^"]+)"/;

router.get("/embed/tumblr", isLoggedIn, async (req, res) => {
  const { url } = req.query;

  // @ts-ignore
  if (!req.currentUser) {
    res.sendStatus(403);
    return;
  }

  axios
    .get(`https://www.tumblr.com/oembed/1.0?url=${url}`)
    .then((tumblrRes) => {
      res.status(200).send({
        did: tumblrRes.data.html.match(EXTRACT_DID_REGEX)?.[1],
        href: tumblrRes.data.html.match(EXTRACT_HREF_REGEX)?.[1],
        url,
      });
    })
    .catch((e) => {
      error(`Error while fetching tumblr embed for ${url}:`);
      error(e);
      res.sendStatus(500);
    });
});

export default router;
