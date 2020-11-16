import debug from "debug";
import express from "express";
import { isLoggedIn } from "../auth-handler";
import {
  makeServerPost,
  ensureNoIdentityLeakage
} from "../response-utils";
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

router.get("/search", isLoggedIn, async (req, res) => {
  const includeTags = querystringParamToArray(req.query.tags);
  const excludeTags = querystringParamToArray(req.query.exclude);

  if (includeTags.length === 0) {
    res.sendStatus(400);
    return;
  }
  // @ts-ignore
  const firebase_id = req.currentUser?.uid;
  if(!firebase_id) {
    res.sendStatus(401);
    return
  }
  const postsWithTags = await getPostsWithTags({
    firebase_id,
    includeTags,
    excludeTags});

  for(let postWithTags of postsWithTags) {
    postWithTags.post_info = makeServerPost(postWithTags.post_info);
    postWithTags.parent_post_info = makeServerPost(postWithTags.parent_post_info)
    ensureNoIdentityLeakage(postWithTags.post_info);
    ensureNoIdentityLeakage(postWithTags.parent_post_info);
    if(postWithTags.parent_post_info.post_id === null) {
      postWithTags.parent_post_info = {};
    }
  };

  return res.status(200).json(postsWithTags);
});

export default router;
