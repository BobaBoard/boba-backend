import debug from "debug";
import express from "express";
import {
  getBoardBySlug,
  getBoardActivityBySlug,
  getBoards,
  markBoardVisit,
} from "./queries";
import { isLoggedIn } from "../auth-handler";
import { transformImageUrls, mergeActivityIdentities } from "../response-utils";

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
  log(`Fetching activity data for board with slug ${slug}`);

  const activity = await getBoardActivityBySlug({
    slug,
    // @ts-ignore
    firebaseId: req.currentUser?.uid,
  });
  log(`Found activity for board ${slug}:`, activity);

  if (activity === false) {
    res.sendStatus(500);
    return;
  }
  if (!activity) {
    res.sendStatus(404);
    return;
  }
  if (!activity.length) {
    res.sendStatus(204);
    return;
  }
  res.status(200).json(mergeActivityIdentities(activity));
});

router.get("/", async (req, res) => {
  const boards = await getBoards();
  res.status(200).json(boards.map((board: any) => transformImageUrls(board)));
});

router.get("/activity/latest", async (req, res) => {
  // TODO: implement. Gets latest active boards.
  res.status(501);
});

export default router;
