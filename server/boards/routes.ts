import debug from "debug";
import express from "express";
import { getBoardBySlug } from "./queries";

const log = debug("bobaserver:board:routes");

const router = express.Router();

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  log(`Fetching data for board with slug ${slug}`);

  const board = await getBoardBySlug(slug);
  log(`Found board %O`, board);

  if (!board) {
    res.sendStatus(404);
    return;
  }
  res.status(200).json(board);
});

router.get("/:slug/activity/latest", async (req, res) => {
  // TODO: implement. Gets latest activity from board named slug.
  res.status(501);
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
