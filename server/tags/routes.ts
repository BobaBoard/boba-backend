import debug from "debug";
import express from "express";
import {
  getPostsWithTags
} from "./queries"; 

const router = express.Router();
const log = debug("bobaserver:tags:routes-log");

function querystringParamToArray(param: any): string[] {
  switch(typeof param) {
    case 'string':
      return [param];
    case 'object':
      if (Array.isArray(param)) {
        return param
      }
    default:
      return [];
  }
}

router.get("/search", async (req, res) => {
  const includeTags = querystringParamToArray(req.query.tags);
  const excludeTags = querystringParamToArray(req.query.exclude);

  const postsWithTags = await getPostsWithTags({includeTags, excludeTags});

  if (!postsWithTags) {
    res.sendStatus(500);
    return;
  }

  return res.status(200).json(postsWithTags);
});

export default router;
