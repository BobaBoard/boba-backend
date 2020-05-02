import debug from "debug";
import express from "express";
import { getThreadByStringId, getThreadIdentitiesByStringId } from "./queries";

const info = debug("bobaserver:threads:routes:info");
const log = debug("bobaserver:threads:routes");

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  log(`Fetching data for thread with id ${id}`);

  // We do two separate queries for now. It's not ideal
  // but it beats writing a complex SQL query.
  const [thread, identities] = await Promise.all([
    getThreadByStringId(id),
    getThreadIdentitiesByStringId(id),
  ]);
  info(`Found thread %O`, thread);
  info(`Found identities %O`, identities);

  if (!thread) {
    res.sendStatus(404);
    return;
  }
  // TODO: add identity management logic to thread
  res.status(200).json(thread);
});

export default router;
