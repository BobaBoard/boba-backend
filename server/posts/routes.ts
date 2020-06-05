import debug from "debug";
import express from "express";
import { postNewContribution, postNewComment } from "./queries";
import { isLoggedIn } from "../auth-handler";

const info = debug("bobaserver:posts:routes:info");
const log = debug("bobaserver:posts:routes");

const router = express.Router();

router.post("/:postId/contribute", isLoggedIn, async (req, res) => {
  const { postId } = req.params;
  log(`body: `, req.body);
  // @ts-ignore
  log(`user`, req.currentUser);
  const { content, forceAnonymous } = req.body;

  // @ts-ignore
  if (!req.currentUser) {
    res.sendStatus(403);
    return;
  }

  log(`Making countribution to post with id ${postId}`);
  log(`Content: `, content);
  log(`Anonymous: `, forceAnonymous);

  const post = await postNewContribution({
    // @ts-ignore
    userId: 1,
    replyTo: postId,
    content,
    anonymityType: forceAnonymous ? "everyone" : "strangers",
  });
  log(`Contribution posted: `, post);

  if (!post) {
    res.sendStatus(500);
    return;
  }
  res.status(200).json(post);
});

router.post("/:postId/comment", isLoggedIn, async (req, res) => {
  const { postId } = req.params;
  log(`body: `, req.body);
  // @ts-ignore
  log(`user`, req.currentUser);
  const { content, forceAnonymous } = req.body;

  // @ts-ignore
  if (!req.currentUser) {
    res.sendStatus(403);
    return;
  }

  log(`Making comment to post with id ${postId}`);
  log(`Content: `, content);
  log(`Anonymous: `, forceAnonymous);

  const post = await postNewComment({
    // @ts-ignore
    userId: 1,
    replyTo: postId,
    content,
    anonymityType: forceAnonymous ? "everyone" : "strangers",
  });
  log(`Contribution posted: `, post);

  if (!post) {
    res.sendStatus(500);
    return;
  }
  res.status(200).json(post);
});

export default router;
