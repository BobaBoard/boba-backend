//import debug from "debug";
import express from "express";
//import { cache, CacheKeys } from "../cache";
/*
import {
} from "./queries"; // TODO
 */

const router = express.Router();

router.get("/search", async (req, res) => {
  const { tags, exclude } = req.query;
  return res.status(200).json({
    "tags" : `${tags}`,
    "exclude" : `${exclude}`
  });
});

export default router;
