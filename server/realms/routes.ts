import debug from "debug";
import express from "express";
import { isLoggedIn } from "../auth-handler";
import {
  ensureNoIdentityLeakage,
  mergeObjectIdentity,
  transformImageUrls,
} from "../response-utils";
import firebaseAuth from "firebase-admin";
import { ServerThreadType, DbActivityThreadType } from "../../Types";
import { cache, CacheKeys } from "../cache";
import { aggregateByType, parseSettings } from "../utils/settings";

const info = debug("bobaserver:users:routes-info");
const log = debug("bobaserver:users:routes-log");
const error = debug("bobaserver:users:routes-error");

const router = express.Router();

router.get("/:id", isLoggedIn, async (req, res) => {
  let currentUserId: string = req.currentUser?.uid;
  const { id } = req.params;
  //   if (!currentUserId) {
  //     res.sendStatus(401);
  //     return;
  //   }

  //   const cachedData = await cache().hget(CacheKeys.USER, currentUserId);
  //   if (cachedData) {
  //     log(`Returning cached data for user ${currentUserId}`);
  //     return res.status(200).json(JSON.parse(cachedData));
  //   }

  //   log(`Fetching user data for firebase id: ${currentUserId}`);
  //   const userData = transformImageUrls(
  //     await getUserFromFirebaseId({
  //       firebaseId: currentUserId,
  //     })
  //   );
  //   info(`Found user data : `, userData);

  //   const userDataResponse = {
  //     username: userData.username,
  //     avatarUrl: userData.avatarUrl,
  //   };
  res.status(200).json({
    name: id,
    rootCssVariables: {
      name: "--css",
      value: "test",
    },
  });
});

export default router;
