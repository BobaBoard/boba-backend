import debug from "debug";
import express from "express";
import {
  getThreadByStringId,
  getThreadIdentitiesByStringId,
  createThread,
  markThreadVisit,
} from "./queries";
import { isLoggedIn } from "../auth-handler";
import { mergeThreadAndIdentities } from "../response-utils";

const info = debug("bobaserver:threads:routes-info");
const log = debug("bobaserver:threads:routes-log");

const router = express.Router();

router.get("/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  log(`Fetching data for thread with id ${id}`);

  const [thread, identities] = await Promise.all([
    getThreadByStringId({
      id,
      // @ts-ignore
      user: req.currentUser?.uid,
    }),
    getThreadIdentitiesByStringId({
      id,
      // @ts-ignore
      user: req.currentUser?.uid,
    }),
  ]);
  info(`Found thread: `, thread);
  info(`Found identities: `, identities);

  if (!thread) {
    res.sendStatus(404);
    return;
  }

  info(`sending back data for thread ${id}.`);
  res.status(200).json(mergeThreadAndIdentities(thread, identities));
});

router.get("/:threadId/visit", isLoggedIn, async (req, res) => {
  const { threadId } = req.params;
  // @ts-ignore
  if (!req.currentUser) {
    return res.sendStatus(301);
  }
  log(`Setting last visited time for thread: ${threadId}`);

  if (
    !(await markThreadVisit({
      // @ts-ignore
      firebaseId: req.currentUser.uid,
      threadId,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  info(`Marked last visited time for thread: ${threadId}.`);
  res.status(200).json();
});

router.get("/activity/latest", async (req, res) => {
  // TODO: implement. Gets latest active threads.
  res.status(501);
});

router.post("/:boardSlug/create", isLoggedIn, async (req, res) => {
  // @ts-ignore
  if (!req.currentUser) {
    return res.sendStatus(301);
  }
  const { boardSlug } = req.params;
  log(`Creating thread in board with slug ${boardSlug}`);
  const { content, forceAnonymous } = req.body;

  const threadStringId = await createThread({
    // @ts-ignore
    userId: req.currentUser.uid,
    content,
    anonymityType: "everyone",
    boardSlug: boardSlug,
  });
  info(`Created new thread %O`, threadStringId);

  if (!threadStringId) {
    res.sendStatus(500);
    return;
  }
  res.status(200).json(
    await getThreadByStringId({
      id: threadStringId,
      // @ts-ignore
      user: req.currentUser.uid,
    })
  );
});

export default router;
