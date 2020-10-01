import debug from "debug";
import express from "express";
import {
  getBoardBySlug,
  getBoardActivityBySlug,
  getBoards,
  markBoardVisit,
  muteBoard,
  unmuteBoard,
  dismissBoardNotifications,
} from "./queries";
import { isLoggedIn } from "../auth-handler";
import {
  transformImageUrls,
  mergeObjectIdentity,
  ensureNoIdentityLeakage,
} from "../response-utils";
import { transformPermissions } from "../permissions-utils";
import { DbActivityThreadType, ServerThreadType } from "../../Types";

const info = debug("bobaserver:board:routes-info");
const log = debug("bobaserver:board:routes");

const router = express.Router();

router.get("/:slug", isLoggedIn, async (req, res) => {
  const { slug } = req.params;
  log(`Fetching data for board with slug ${slug}`);

  const board = await getBoardBySlug({
    // @ts-ignore
    firebaseId: req.currentUser?.uid,
    slug,
  });
  log(`Found board`, board);

  if (!board) {
    res.sendStatus(404);
    return;
  }
  board.permissions = transformPermissions(board.permissions);
  board.postingIdentities = board.posting_identities.map((identity: any) =>
    transformImageUrls(identity)
  );
  delete board.posting_identities;
  res.status(200).json(transformImageUrls(board));
});

router.get("/:slug/visit", isLoggedIn, async (req, res) => {
  const { slug } = req.params;
  // @ts-ignore
  if (!req.currentUser) {
    // TODO: fix wrong status
    return res.sendStatus(401);
  }
  log(`Setting last visited time for board: ${slug}`);

  if (
    !(await markBoardVisit({
      // @ts-ignore
      firebaseId: req.currentUser.uid,
      slug,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  log(`Marked last visited time for board: ${slug}.`);
  res.status(200).json();
});

router.post("/:slug/mute", isLoggedIn, async (req, res) => {
  const { slug } = req.params;
  // @ts-ignore
  if (!req.currentUser) {
    return res.sendStatus(401);
  }
  log(`Setting board muted: ${slug}`);

  if (
    !(await muteBoard({
      // @ts-ignore
      firebaseId: req.currentUser.uid,
      slug,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  // @ts-ignore
  info(`Muted board: ${slug} for user ${req.currentUser.uid}.`);
  res.status(200).json();
});

router.post("/:slug/unmute", isLoggedIn, async (req, res) => {
  const { slug } = req.params;
  // @ts-ignore
  if (!req.currentUser) {
    return res.sendStatus(401);
  }
  log(`Setting board unmuted: ${slug}`);

  if (
    !(await unmuteBoard({
      // @ts-ignore
      firebaseId: req.currentUser.uid,
      slug,
    }))
  ) {
    res.sendStatus(500);
    return;
  }

  // @ts-ignore
  info(`Unmuted board: ${slug} for user ${req.currentUser.uid}.`);
  res.status(200).json();
});

0;
router.post("/:slug/notifications/dismiss", isLoggedIn, async (req, res) => {
  const { slug } = req.params;
  // @ts-ignore
  let currentUserId: string = req.currentUser?.uid;
  if (!currentUserId) {
    res.sendStatus(401);
    return;
  }
  log(`Dismissing ${slug} notifications for firebase id: ${currentUserId}`);
  const dismissSuccessful = await dismissBoardNotifications({
    slug,
    firebaseId: currentUserId,
  });

  if (!dismissSuccessful) {
    log(`Dismiss failed`);
    return res.sendStatus(500);
  }

  info(`Dismiss successful`);

  res.sendStatus(204);
});

router.get("/:slug/activity/latest", isLoggedIn, async (req, res) => {
  const { slug } = req.params;
  const { cursor } = req.query;
  log(
    `Fetching activity data for board with slug ${slug} with cursor ${cursor}`
  );

  const result = await getBoardActivityBySlug({
    slug,
    // @ts-ignore
    firebaseId: req.currentUser?.uid,
    cursor: (cursor as string) || null,
  });
  log(`Found activity for board ${slug}:`, result);

  if (result === false) {
    res.sendStatus(500);
    return;
  }
  if (!result) {
    res.sendStatus(404);
    return;
  }
  if (!result.activity.length) {
    res.sendStatus(204);
    return;
  }

  const threadsWithIdentity = result.activity.map(
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
        thread_id: threadWithIdentity.thread_id,
        thread_new_posts_amount: threadWithIdentity.new_posts_amount,
        thread_new_comments_amount: threadWithIdentity.new_comments_amount,
        thread_total_comments_amount: threadWithIdentity.comments_amount,
        thread_total_posts_amount: threadWithIdentity.posts_amount,
        thread_last_activity: threadWithIdentity.thread_last_activity,
        thread_direct_threads_amount: threadWithIdentity.threads_amount,
        muted: threadWithIdentity.muted,
        hidden: threadWithIdentity.hidden,
      };
    }
  );
  const response: {
    next_page_cursor: string;
    activity: ServerThreadType[];
  } = { next_page_cursor: result.cursor, activity: threadsWithIdentity };

  response.activity.map((post) => ensureNoIdentityLeakage(post));
  res.status(200).json(response);
});

router.get("/", isLoggedIn, async (req, res) => {
  const boards = await getBoards({
    // @ts-ignore
    firebaseId: req.currentUser?.uid,
  });
  if (!boards) {
    res.status(500);
  }

  res.status(200).json(boards.map((board: any) => transformImageUrls(board)));
});

export default router;
