import debug from "debug";
import express from "express";
import { getThreadByStringId, createThread, markThreadVisit } from "./queries";
import { isLoggedIn } from "../auth-handler";
import { makeServerThread, ensureNoIdentityLeakage } from "../response-utils";

const info = debug("bobaserver:threads:routes-info");
const log = debug("bobaserver:threads:routes-log");

const router = express.Router();

router.get("/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  log(`Fetching data for thread with id ${id}`);

  const thread = await getThreadByStringId({
    threadId: id,
    // @ts-ignore
    firebaseId: req.currentUser?.uid,
  });
  info(`Found thread: `, thread);

  if (thread === false) {
    res.sendStatus(500);
    return;
  }
  if (!thread) {
    res.sendStatus(404);
    return;
  }

  const serverThread = makeServerThread(thread);
  ensureNoIdentityLeakage(serverThread);

  info(`sending back data for thread ${id}.`);
  res.status(200).json(serverThread);
});

router.get("/:threadId/visit", isLoggedIn, async (req, res) => {
  const { threadId } = req.params;
  // @ts-ignore
  if (!req.currentUser) {
    // TODO: fix wrong status
    return res.sendStatus(401);
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
    return res.sendStatus(401);
  }
  const { boardSlug } = req.params;
  log(`Creating thread in board with slug ${boardSlug}`);
  const { content, forceAnonymous, large, whisperTags } = req.body;

  const threadStringId = await createThread({
    // @ts-ignore
    firebaseId: req.currentUser.uid,
    content,
    anonymityType: "everyone",
    isLarge: !!large,
    boardSlug: boardSlug,
    whisperTags,
  });
  info(`Created new thread`, threadStringId);

  if (threadStringId === false) {
    res.sendStatus(500);
    return;
  }
  res.status(200).json(
    await getThreadByStringId({
      threadId: threadStringId as string,
      // @ts-ignore
      firebaseId: req.currentUser.uid,
    })
  );
});

export default router;
