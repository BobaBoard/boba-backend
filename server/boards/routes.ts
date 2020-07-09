import debug from "debug";
import express from "express";
import {
  getBoardBySlug,
  getBoardActivityBySlug,
  getBoards,
  markBoardVisit,
} from "./queries";
import { isLoggedIn } from "../auth-handler";
import {
  transformImageUrls,
  mergeObjectIdentity,
  ensureNoIdentityLeakage,
} from "../response-utils";
import { DbActivityThreadType, ServerThreadType } from "../types/Types";

const log = debug("bobaserver:board:routes");

const router = express.Router();

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  log(`Fetching data for board with slug ${slug}`);

  const board = await getBoardBySlug(slug);
  log(`Found board`, board);

  if (!board) {
    res.sendStatus(404);
    return;
  }
  res.status(200).json(transformImageUrls(board));
});

router.get("/:slug/visit", isLoggedIn, async (req, res) => {
  const { slug } = req.params;
  // @ts-ignore
  if (!req.currentUser) {
    // TODO: fix wrong status
    return res.sendStatus(301);
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

router.get("/activity/latest", async (req, res) => {
  // TODO: implement. Gets latest active boards.
  res.status(501);
});

export default router;
