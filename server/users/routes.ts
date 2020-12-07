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
  getUserActivity,
} from "./queries";
import { isLoggedIn } from "../auth-handler";
import {
  ensureNoIdentityLeakage,
  mergeObjectIdentity,
  transformImageUrls,
} from "../response-utils";
import firebaseAuth from "firebase-admin";
import { ServerThreadType, DbActivityThreadType } from "../../Types";
import { cache, CacheKeys } from "../cache";

const info = debug("bobaserver:users:routes-info");
const log = debug("bobaserver:users:routes-log");
const error = debug("bobaserver:users:routes-error");

const router = express.Router();

router.get("/me", isLoggedIn, async (req, res) => {
  let currentUserId: string = req.currentUser?.uid;
  if (!currentUserId) {
    res.sendStatus(401);
    return;
  }

  const cachedData = await cache().hget(CacheKeys.USER, currentUserId);
  if (cachedData) {
    log(`Returning cached data for user ${currentUserId}`);
    return res.status(200).json(JSON.parse(cachedData));
  }

  log(`Fetching user data for firebase id: ${currentUserId}`);
  const userData = transformImageUrls(
    await getUserFromFirebaseId({
      firebaseId: currentUserId,
    })
  );
  info(`Found user data : `, userData);

  const userDataResponse = {
    username: userData.username,
    avatarUrl: userData.avatarUrl,
  };
  res.status(200).json(userDataResponse);
  cache().hset(CacheKeys.USER, currentUserId, JSON.stringify(userDataResponse));
});

router.post("/me/update", isLoggedIn, async (req, res) => {
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

  await cache().hdel(CacheKeys.USER, currentUserId);
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
  let currentUserId: string = req.currentUser?.uid;
  if (!currentUserId) {
    res.sendStatus(401);
    return;
  }
  const identities = await getBobadexIdentities({ firebaseId: currentUserId });
  res.status(200).json(identities);
});

router.post("/notifications/dismiss", isLoggedIn, async (req, res) => {
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

router.get("/me/feed", isLoggedIn, async (req, res) => {
  const { cursor, updatedOnly, ownOnly } = req.query;
  let currentUserId: string = req.currentUser?.uid;
  if (!currentUserId) {
    res.sendStatus(401);
    return;
  }
  const userActivity = await getUserActivity({
    firebaseId: currentUserId,
    cursor: (cursor as string) || null,
    updatedOnly: updatedOnly === "true",
    ownOnly: ownOnly === "true",
  });

  if (!userActivity) {
    res.sendStatus(404);
    return;
  }
  if (!userActivity.activity.length) {
    res.sendStatus(204);
    return;
  }

  const threadsWithIdentity = userActivity.activity.map(
    (thread): ServerThreadType => {
      const threadWithIdentity = mergeObjectIdentity<DbActivityThreadType>(
        thread
      );
      return {
        posts: [
          {
            post_id: threadWithIdentity.post_id,
            parent_thread_id: threadWithIdentity.thread_id,
            parent_post_id: threadWithIdentity.parent_post_id,
            secret_identity: threadWithIdentity.secret_identity,
            user_identity: threadWithIdentity.user_identity,
            self: threadWithIdentity.self,
            friend: threadWithIdentity.friend,
            created: threadWithIdentity.created,
            content: threadWithIdentity.content,
            options: threadWithIdentity.options,
            tags: {
              whisper_tags: threadWithIdentity.whisper_tags,
              index_tags: threadWithIdentity.index_tags,
              category_tags: threadWithIdentity.category_tags,
              content_warnings: threadWithIdentity.content_warnings,
            },
            total_comments_amount: threadWithIdentity.comments_amount,
            new_comments_amount: threadWithIdentity.new_comments_amount,
            is_new: threadWithIdentity.is_new,
          },
        ],
        default_view: threadWithIdentity.default_view,
        thread_id: threadWithIdentity.thread_id,
        thread_new_posts_amount: threadWithIdentity.new_posts_amount,
        thread_new_comments_amount: threadWithIdentity.new_comments_amount,
        thread_total_comments_amount: threadWithIdentity.comments_amount,
        thread_total_posts_amount: threadWithIdentity.posts_amount,
        thread_last_activity: threadWithIdentity.thread_last_activity,
        thread_direct_threads_amount: threadWithIdentity.threads_amount,
        board_slug: threadWithIdentity.board_slug,
        muted: threadWithIdentity.muted,
        hidden: threadWithIdentity.hidden,
      };
    }
  );
  const response: {
    next_page_cursor: string;
    activity: ServerThreadType[];
  } = { next_page_cursor: userActivity.cursor, activity: threadsWithIdentity };

  response.activity.map((post) => ensureNoIdentityLeakage(post));
  res.status(200).json(response);
});

export default router;
