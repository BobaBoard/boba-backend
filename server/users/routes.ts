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
  getUserSettings,
  updateUserSettings,
} from "./queries";
import {
  ensureLoggedIn,
  isLoggedIn,
  withUserSettings,
} from "../../handlers/auth";
import {
  ensureNoIdentityLeakage,
  mergeObjectIdentity,
  processBoardsNotifications,
  processBoardsSummary,
  transformImageUrls,
} from "../../utils/response-utils";
import firebaseAuth from "firebase-admin";
import { ServerThreadType, DbActivityThreadType } from "../../Types";
import { cache, CacheKeys } from "../cache";
import { aggregateByType, parseSettings } from "../../utils/settings";
import { getBoards } from "../boards/queries";

const info = debug("bobaserver:users:routes-info");
const log = debug("bobaserver:users:routes-log");
const error = debug("bobaserver:users:routes-error");

const router = express.Router();

/**
 * @openapi
 * users/@me:
 *   get:
 *     summary: Gets data for the current user.
 *     tags:
 *       - /users/
 *     security:
 *       - firebase: []
 *     responses:
 *       401:
 *         description: User was not found in request that requires authentication.
 *       403:
 *         description: User is not authorized to perform the action.
 *       200:
 *         description: The user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 avatar_url:
 *                   type: string
 *                   format: uri
 *                 pinned_boards:
 *                   description: |
 *                     A map from board id to its LoggedInSummary for each pinned board.
 *                   type: object
 *                   additionalProperties:
 *                     allOf:
 *                       - $ref: "#/components/schemas/LoggedInBoardSummary"
 *                       - type: object
 *                         properties:
 *                           index:
 *                             type: number
 *                         required:
 *                           - index
 *               required:
 *                 - pinned_boards
 */
router.get("/@me", ensureLoggedIn, async (req, res) => {
  let currentUserId: string = req.currentUser?.uid;
  // const cachedData = await cache().hget(CacheKeys.USER, currentUserId);
  // if (cachedData) {
  //   log(`Returning cached data for user ${currentUserId}`);
  //   return res.status(200).json(JSON.parse(cachedData));
  // }

  log(`Fetching user data for firebase id: ${currentUserId}`);
  const userData = transformImageUrls(
    await getUserFromFirebaseId({
      firebaseId: currentUserId,
    })
  );
  info(`Found user data : `, userData);

  // TODO[realms]: this needs a specific per-user query
  const boards = await getBoards({
    firebaseId: req.currentUser?.uid,
  });

  if (!boards) {
    res.status(500);
  }

  const summaries = processBoardsSummary({
    boards,
    isLoggedIn: !!req.currentUser?.uid,
  });
  const pins = summaries
    .filter((board: any) => board.pinned)
    .reduce((result: any, current: any) => {
      result[current.slug] = {
        ...current,
        index: boards.find(({ slug }: any) => current.slug == slug)
          .pinned_order,
      };
      return result;
    }, {});

  const userDataResponse = {
    username: userData.username,
    avatar_url: userData.avatarUrl,
    pinned_boards: pins,
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

/**
 * @openapi
 * users/@me/notifications:
 *   get:
 *     summary: Gets notifications data for the current user.
 *     description: |
 *       Gets notifications data for the current user, including pinned boards.
 *       If `realm_id` is present, also fetch notification data for the current realm.
 *     tags:
 *       - /users/
 *     security:
 *       - firebase: []
 *     responses:
 *       401:
 *         description: User was not found in request that requires authentication.
 *       403:
 *         description: User is not authorized to perform the action.
 *       200:
 *         description: The notifications data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 has_notifications:
 *                   type: boolean
 *                 is_outdated_notifications:
 *                   type: boolean
 *                 realm_boards:
 *                   description: |
 *                     A map from board id to its NotificationsStatus for each realm board.
 *                     If `realm_id` is not present in the params, it will be empty.
 *                   type: object
 *                   additionalProperties:
 *                     $ref: "#/components/schemas/BoardNotifications"
 *                 pinned_boards:
 *                   description: |
 *                     A map from board id to its NotificationsStatus for each pinned board.
 *                   type: object
 *                   additionalProperties:
 *                     $ref: "#/components/schemas/BoardNotifications"
 *               required:
 *                 - has_notifications
 *                 - is_outdated_notifications
 *                 - pinned_boards
 *                 - realm_boards
 */
router.get("/@me/notifications", ensureLoggedIn, async (req, res) => {
  const { realm_id } = req.params;

  // TODO[realms]: this needs a specific per-realm query
  const boards = await getBoards({
    firebaseId: req.currentUser?.uid,
  });

  if (!boards) {
    res.status(500);
  }
  const notifications = processBoardsNotifications({
    boards,
  });
  const pinned = notifications
    .filter((notification: any) =>
      boards.find(
        (board: any) =>
          board.slug == notification.id && board.pinned_order !== null
      )
    )
    .reduce((result: any, current: any) => {
      result[current.id] = {
        ...current,
      };
      return result;
    }, {});
  const realm = notifications.reduce((result: any, current: any) => {
    result[current.id] = {
      ...current,
    };
    return result;
  }, {});

  const hasNotifications = notifications.some(
    (notification) => notification.has_updates
  );
  const isOutdatedNotifications = hasNotifications
    ? notifications.every(
        (notification) =>
          notification.has_updates === false || notification.is_outdated
      )
    : false;
  const notificationsDataResponse = {
    has_notifications: hasNotifications,
    is_outdated_notifications: isOutdatedNotifications,
    pinned_boards: pinned,
    realm_boards: realm,
  };
  res.status(200).json(notificationsDataResponse);
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
      const threadWithIdentity =
        mergeObjectIdentity<DbActivityThreadType>(thread);
      return {
        posts: [
          {
            id: threadWithIdentity.post_id,
            parent_thread_id: threadWithIdentity.thread_id,
            parent_post_id: threadWithIdentity.parent_post_id,
            secret_identity: threadWithIdentity.secret_identity,
            user_identity: threadWithIdentity.user_identity,
            accessory_avatar: threadWithIdentity.accessory_avatar,
            own: threadWithIdentity.self,
            friend: threadWithIdentity.friend,
            created_at: threadWithIdentity.created,
            content: threadWithIdentity.content,
            tags: {
              whisper_tags: threadWithIdentity.whisper_tags,
              index_tags: threadWithIdentity.index_tags,
              category_tags: threadWithIdentity.category_tags,
              content_warnings: threadWithIdentity.content_warnings,
            },
            total_comments_amount: threadWithIdentity.comments_amount,
            new_comments_amount: threadWithIdentity.new_comments_amount,
            new: threadWithIdentity.is_new,
          },
        ],
        comments: [] as any,
        starter: {
          id: threadWithIdentity.post_id,
          parent_thread_id: threadWithIdentity.thread_id,
          parent_post_id: threadWithIdentity.parent_post_id,
          secret_identity: threadWithIdentity.secret_identity,
          user_identity: threadWithIdentity.user_identity,
          accessory_avatar: threadWithIdentity.accessory_avatar,
          own: threadWithIdentity.self,
          friend: threadWithIdentity.friend,
          created_at: threadWithIdentity.created,
          content: threadWithIdentity.content,
          tags: {
            whisper_tags: threadWithIdentity.whisper_tags,
            index_tags: threadWithIdentity.index_tags,
            category_tags: threadWithIdentity.category_tags,
            content_warnings: threadWithIdentity.content_warnings,
          },
          total_comments_amount: threadWithIdentity.comments_amount,
          new_comments_amount: threadWithIdentity.new_comments_amount,
          new: threadWithIdentity.is_new,
        },
        default_view: threadWithIdentity.default_view,
        id: threadWithIdentity.thread_id,
        new_posts_amount: threadWithIdentity.new_posts_amount,
        new_comments_amount: threadWithIdentity.new_comments_amount,
        total_comments_amount: threadWithIdentity.comments_amount,
        total_posts_amount: threadWithIdentity.posts_amount,
        last_activity_at: threadWithIdentity.thread_last_activity,
        direct_threads_amount: threadWithIdentity.threads_amount,
        parent_board_slug: threadWithIdentity.board_slug,
        muted: threadWithIdentity.muted,
        hidden: threadWithIdentity.hidden,
        new: threadWithIdentity.is_new,
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

router.post("/settings/update", isLoggedIn, async (req, res) => {
  const { name, value } = req.body;

  const firebaseId = req.currentUser?.uid;
  if (!firebaseId) {
    res.sendStatus(401);
    return;
  }
  try {
    await updateUserSettings({
      firebaseId,
      settingName: name,
      settingValue: value,
    });

    const settings = await getUserSettings({ firebaseId });
    await cache().hset(
      CacheKeys.USER_SETTINGS,
      firebaseId,
      JSON.stringify(settings)
    );
    res.status(200).json(aggregateByType(settings));
  } catch (e) {
    error(e);
    res.status(500).send("Error while updating settings.");
  }
});

router.get("/settings", ensureLoggedIn, withUserSettings, async (req, res) => {
  try {
    res.status(200).json(aggregateByType(req.currentUser?.settings));
  } catch (e) {
    error(e);
    res.status(500).send("Error while fetching settings.");
  }
});

export default router;
