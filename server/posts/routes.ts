import debug from "debug";
import express from "express";
import { postNewContribution } from "./queries";

const info = debug("bobaserver:posts:routes:info");
const log = debug("bobaserver:posts:routes");

const router = express.Router();

router.post("/:postId/contribute", async (req, res) => {
  const { postId } = req.params;
  log(`body: `, req.body);
  const { content, forceAnonymous } = req.body;
  log(`Making countribution to post with id ${postId}`);
  log(`Content: `, content);
  log(`Anonymous: `, forceAnonymous);

  const post = await postNewContribution({
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
