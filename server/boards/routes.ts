import debug from "debug";
import express from "express";
import { getBoardBySlug, getBoardActivityBySlug } from "./queries";
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

  const activity = await getBoardActivityBySlug(slug);
  log(`Found activity for board %0: %1`, slug, activity);

  if (!activity) {
    res.sendStatus(404);
    return;
  }
  res.status(200).json(activity);
});

router.get("/", async (req, res) => {
  // TODO: implement. Gets all boards.
  res.status(501);
});

router.get("/activity/latest", async (req, res) => {
  // TODO: implement. Gets latest active boards.
  res.status(501);
});

export default router;
