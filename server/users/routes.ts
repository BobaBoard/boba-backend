import debug from "debug";
import express from "express";
import {
  getUserFromFirebaseId,
  dismissAllNotifications,
  updateUserData,
} from "./queries";
import { isLoggedIn } from "../auth-handler";
import { transformImageUrls } from "../response-utils";

const info = debug("bobaserver:users:routes-info");
const log = debug("bobaserver:users:routes-log");
const error = debug("bobaserver:users:routes-error");

const router = express.Router();

router.get("/me", isLoggedIn, async (req, res) => {
  // @ts-ignore
  let currentUserId: string = req.currentUser?.uid;
  if (!currentUserId) {
    res.sendStatus(401);
    return;
  }
  log(`Fetching user data for firebase id: ${currentUserId}`);
  const userData = transformImageUrls(
    await getUserFromFirebaseId({
      firebaseId: currentUserId,
    })
  );
  info(`Found user data : `, userData);

  res.status(200).json({
    username: userData.username,
    avatarUrl: userData.avatarUrl,
  });
});

router.post("/me/update", isLoggedIn, async (req, res) => {
  // @ts-ignore
  let currentUserId: string = req.currentUser?.uid;
  if (!currentUserId) {
    res.sendStatus(401);
    return;
  }
  const { username, avatarUrl } = req.body;

  if (!username || !avatarUrl) {
    res.sendStatus(400);
    return;
  }
  log(`Updating user data for firebase id: ${currentUserId}`);

  const userData = await updateUserData({
    firebaseId: currentUserId,
    username,
    avatarUrl,
  });
  info(`Updated user data : `, userData);

  if (!userData) {
    res.sendStatus(500);
    return;
  }

  res.status(200).json({
    username: userData.username,
    avatarUrl: userData.avatarUrl,
  });
});

router.post("/notifications/dismiss", isLoggedIn, async (req, res) => {
  // @ts-ignore
  let currentUserId: string = req.currentUser?.uid;
  if (!currentUserId) {
    res.sendStatus(401);
    return;
  }
  log(`Dismissing notifications for firebase id: ${currentUserId}`);
  const dismissSuccessful = await dismissAllNotifications({
    firebaseId: currentUserId,
  });

  if (!dismissSuccessful) {
    error(`Dismiss failed`);
    return res.sendStatus(500);
    return;
  }

  info(`Dismiss successful`);

  res.sendStatus(204);
});

export default router;
