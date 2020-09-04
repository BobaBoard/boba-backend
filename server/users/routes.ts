import debug from "debug";
import express from "express";
import {
  getUserFromFirebaseId,
  dismissAllNotifications,
  updateUserData,
  getInviteDetails,
  markInviteUsed,
  createNewUser,
  getBobadexIdentities,
} from "./queries";
import { isLoggedIn } from "../auth-handler";
import { transformImageUrls } from "../response-utils";
import firebaseAuth from "firebase-admin";

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

router.post("/invite/accept", async (req, res) => {
  const { email, password, nonce } = req.body;

  const inviteDetails = await getInviteDetails({ nonce });

  if (!inviteDetails) {
    res.status(404).json({
      errorCode: "",
      message: "Invite not found.",
    });
    return;
  }

  if (inviteDetails.expired || inviteDetails.used) {
    res.status(403).json({
      errorCode: "",
      message: "Invite expired or already used.",
    });
    return;
  }

  if (inviteDetails.email.toLowerCase() != (email as string).toLowerCase()) {
    res.status(403).json({
      errorCode: "",
      message: "Email doesn't match invite.",
    });
    return;
  }
  firebaseAuth
    .auth()
    .createUser({
      email,
      password,
    })
    .then(async (user) => {
      const uid = user.uid;
      log(`Created new firebase user with uid ${uid}`);
      // TODO: decide whether to put these together in a transaction.
      const success = await markInviteUsed({ nonce });
      if (!success) {
        res.status(500).json({
          errorCode: "",
          message: "Error marking invite as used. User not created.",
        });
        return;
      }
      const created = await createNewUser({
        firebaseId: uid,
        invitedBy: inviteDetails.inviter,
        createdOn: user.metadata.creationTime,
      });
      if (!created) {
        res.status(500).json({
          errorCode: "",
          message: "Error when adding a new user to the database.",
        });
        return;
      }
      res.sendStatus(200);
    })
    .catch((error) => {
      log(error);
      res.status(400).json({
        errorCode: error.code,
        message: error.message,
      });
    });
});

router.get("/me/bobadex", isLoggedIn, async (req, res) => {
  // @ts-ignore
  let currentUserId: string = req.currentUser?.uid;
  if (!currentUserId) {
    res.sendStatus(401);
    return;
  }
  const identities = await getBobadexIdentities({ firebaseId: currentUserId });
  res.status(200).json(identities);
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
