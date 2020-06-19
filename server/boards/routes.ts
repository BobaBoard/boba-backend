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

  const activityWithIdentity = mergeActivityIdentities(result.activity);
  res.status(200).json({
    next_page_cursor: result.cursor,
    activity: activityWithIdentity,
  });
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
