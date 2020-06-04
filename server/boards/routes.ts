import debug from "debug";
import express from "express";
import { getBoardBySlug, getBoardActivityBySlug, getBoards } from "./queries";
import { isLoggedIn } from "../auth-handler";

const log = debug("bobaserver:board:routes");

const router = express.Router();

const turnReferencesIntoUrls = (response: any) => {
  if (response.avatar) {
    response.avatarUrl = `/${response.avatar}`;
  }
  delete response.avatar;

  return response;
};

const mergeIdentities = (activity: any[]) => {
  return activity.map((post: any) => {
    if (post.friend) {
      post.user_identity = {
        name: post.username,
        avatar: post.user_avatar,
      };
    }
    post.secret_identity = {
      name: post.secret_identity,
      avatar: post.secret_avatar,
    };

    delete post.username;
    delete post.user_avatar;
    delete post.user_id;
    delete post.secret_avatar;

    return post;
  });
};

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  log(`Fetching data for board with slug ${slug}`);

  const board = await getBoardBySlug(slug);
  log(`Found board %O`, board);

  if (!board) {
    res.sendStatus(404);
    return;
  }
  res.status(200).json(turnReferencesIntoUrls(board));
});

router.get("/:slug/activity/latest", isLoggedIn, async (req, res) => {
  const { slug } = req.params;
  log(`Fetching activity data for board with slug ${slug}`);

  const activity = await getBoardActivityBySlug({
    slug,
    // @ts-ignore
    firebaseId: req.currentUser?.uid,
  });
  log(`Found activity for board %0: %1`, slug, activity);

  if (!activity) {
    res.sendStatus(404);
    return;
  }
  res.status(200).json(mergeIdentities(activity));
});

router.get("/", async (req, res) => {
  const boards = await getBoards();
  res.status(200).json(boards);
});

router.get("/activity/latest", async (req, res) => {
  // TODO: implement. Gets latest active boards.
  res.status(501);
});

export default router;
