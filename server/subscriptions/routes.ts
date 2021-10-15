import { CacheKeys, cache } from "../cache";

import debug from "debug";
import express from "express";
import { getLatestSubscriptionData } from "./queries";

const info = debug("bobaserver:board:routes-info");
const log = debug("bobaserver:board:routes");

const router = express.Router();

router.get("/:subscriptionId/latest", async (req, res) => {
  const { subscriptionId } = req.params;
  log(`Fetching data for subscription with id ${subscriptionId}`);

  const cachedSubscription = await cache().hget(
    CacheKeys.SUBSCRIPTION,
    subscriptionId
  );
  if (cachedSubscription) {
    log(`Returning cached data for subscription ${subscriptionId}`);
    return res.status(200).json(JSON.parse(cachedSubscription));
  }

  const subscriptionData = await getLatestSubscriptionData({
    subscriptionId,
  });

  res.status(200).json(subscriptionData);
  cache().hset(
    CacheKeys.SUBSCRIPTION,
    subscriptionId,
    JSON.stringify(subscriptionData)
  );
});

export default router;
