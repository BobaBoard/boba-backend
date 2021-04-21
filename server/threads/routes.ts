import debug from "debug";
import express from "express";
import {
  getThreadByStringId,
  createThread,
  markThreadVisit,
  muteThread,
  unmuteThread,
  hideThread,
  unhideThread,
  updateThreadView,
  getUserPermissionsForThread,
  getTriggeredWebhooks,
} from "./queries";
import { isLoggedIn } from "../auth-handler";
import { makeServerThread, ensureNoIdentityLeakage } from "../response-utils";
import { ThreadPermissions } from "../../Types";
import axios from "axios";
import { canAccessBoard } from "../boards/utils";

const info = debug("bobaserver:threads:routes-info");
const log = debug("bobaserver:threads:routes-log");

const router = express.Router();

router.get("/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  log(`Fetching data for thread with id ${id}`);

  // NOTE: if updating this (and it makes sense) also update
  // the method for thread creation + retrieval.
  // TODO: check if this has already been unified
  const thread = await getThreadByStringId({
    threadId: id,
    firebaseId: req.currentUser?.uid,
  });
  info(`Found thread: `, thread);

  if (
    thread &&
    !(await canAccessBoard({
      slug: thread.board_slug,
      firebaseId: req.currentUser?.uid,
    }))
  ) {
    // TOOD: add error log
    return res.sendStatus(403);
  }

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

router.post("/:threadId/mute", isLoggedIn, async (req, res) => {
  const { threadId } = req.params;
  // @ts-ignore
  if (!req.currentUser) {
    return res.sendStatus(401);
  }
  log(`Setting thread muted: ${threadId}`);

  if (
    !(await muteThread({
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

router.post("/:threadId/unmute", isLoggedIn, async (req, res) => {
  const { threadId } = req.params;
  // @ts-ignore
  if (!req.currentUser) {
    return res.sendStatus(401);
  }
  log(`Setting thread unmuted: ${threadId}`);

  if (
    !(await unmuteThread({
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

router.post("/:threadId/hide", isLoggedIn, async (req, res) => {
  const { threadId } = req.params;
  // @ts-ignore
  if (!req.currentUser) {
    return res.sendStatus(401);
  }
  log(`Setting thread hidden: ${threadId}`);

  if (
    !(await hideThread({
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

router.post("/:threadId/unhide", isLoggedIn, async (req, res) => {
  const { threadId } = req.params;
  // @ts-ignore
  if (!req.currentUser) {
    return res.sendStatus(401);
  }
  log(`Setting thread visible: ${threadId}`);

  if (
    !(await unhideThread({
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

router.get("/:threadId/visit", isLoggedIn, async (req, res) => {
  const { threadId } = req.params;
  // @ts-ignore
  if (!req.currentUser) {
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

router.post("/:boardSlug/create", isLoggedIn, async (req, res, next) => {
  // @ts-ignore
  if (!req.currentUser) {
    return res.sendStatus(401);
  }
  const { boardSlug } = req.params;
  log(`Creating thread in board with slug ${boardSlug}`);
  const {
    content,
    forceAnonymous,
    defaultView,
    large,
    whisperTags,
    indexTags,
    categoryTags,
    contentWarnings,
    identityId,
    accessoryId,
  } = req.body;

  const threadStringId = await createThread({
    // @ts-ignore
    firebaseId: req.currentUser.uid,
    content,
    defaultView,
    anonymityType: "everyone",
    isLarge: !!large,
    boardSlug: boardSlug,
    whisperTags,
    indexTags,
    categoryTags,
    contentWarnings,
    identityId,
    accessoryId,
  });
  info(`Created new thread`, threadStringId);

  if (threadStringId === false) {
    res.sendStatus(500);
    return;
  }

  const thread = await getThreadByStringId({
    threadId: threadStringId as string,
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

  info(`sending back data for thread ${threadStringId}.`);
  res.status(200).json(serverThread);

  const webhooks = await getTriggeredWebhooks({
    slug: boardSlug,
    categories: serverThread.posts[0].tags?.category_tags,
  });
  if (webhooks && webhooks.length > 0) {
    const threadUrl = `https://v0.boba.social/!${boardSlug}/thread/${threadStringId}`;
    webhooks.forEach(({ webhook, subscriptionNames }) => {
      const message = `Your "${subscriptionNames.join(
        ", "
      )}" subscription has updated!\n ${threadUrl}`;
      axios.post(webhook, {
        content: message,
        username: serverThread.posts[0].secret_identity.name,
        avatar_url: serverThread.posts[0].secret_identity.avatar,
      });
    });
  }
});

router.post("/:threadId/update/view", isLoggedIn, async (req, res) => {
  const { threadId } = req.params;
  const { defaultView } = req.body;

  // TODO: CHECK PERMISSIONS
  // NOTE: if updating this (and it makes sense) also update
  // the method for thread creation + retrieval.
  const permissions = await getUserPermissionsForThread({
    firebaseId: req.currentUser.uid,
    threadId,
  });

  if (!permissions) {
    log(`Error while fetching permissions for post ${threadId}`);
    res.sendStatus(500);
    return;
  }

  if (
    !permissions.length ||
    !permissions.includes(ThreadPermissions.editDefaultView)
  ) {
    res.sendStatus(401);
    return;
  }

  if (
    !(await updateThreadView({
      threadId,
      defaultView,
    }))
  ) {
    return res.sendStatus(500);
  }

  res.sendStatus(200);
});

export default router;
