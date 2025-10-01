import { CacheKeys, cache } from "../cache.js";

import { NotFound404Error } from "handlers/api-errors/codes.js";
import { type SubscriptionFeed } from "types/rest/subscriptions.js";
import debug from "debug";
import express from "express";
import { getLatestSubscriptionData } from "./queries.js";
import stringify from "fast-json-stable-stringify";

const log = debug("bobaserver:board:routes");

const router = express.Router();
/**
 * @openapi
 * /subscriptions/{subscription_id}:
 *   get:
 *     summary: Gets data for the given subscription. Currently returns only the last update.
 *     operationId: getSubscription
 *     tags:
 *       - /subscriptions/
 *       - unzodded
 *     security:
 *       - {}
 *       - firebase: []
 *     parameters:
 *       - name: subscription_id
 *         in: path
 *         description: The external id of the subscription.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       404:
 *         description: The subscription was not found.
 *       200:
 *         description: The subscription data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SubscriptionActivity"
 */
router.get("/:subscription_id", async (req, res) => {
  const { subscription_id: subscriptionExternalId } = req.params;
  log(`Fetching data for subscription with id ${subscriptionExternalId}`);

  const cachedSubscription = await cache().hGet(
    CacheKeys.SUBSCRIPTION,
    subscriptionExternalId
  );
  if (cachedSubscription) {
    log(`Returning cached data for subscription ${subscriptionExternalId}`);
    return res.status(200).json(JSON.parse(cachedSubscription));
  }

  const subscriptionData = await getLatestSubscriptionData({
    subscriptionExternalId,
  });

  if (!subscriptionData || !subscriptionData.length) {
    throw new NotFound404Error(
      `Webhook for subscription ${subscriptionExternalId} was not found.`
    );
    return;
  }

  const response: SubscriptionFeed = {
    cursor: {
      next: null,
    },
    subscription: {
      id: subscriptionData[0].subscription_external_id,
      name: subscriptionData[0].subscription_name,
      last_activity_at: subscriptionData[0].last_updated_at,
    },
    activity: [
      {
        id: subscriptionData[0].latest_post_string_id!,
        parent_thread_id: subscriptionData[0].thread_external_id,
        parent_post_id: null,
        content: subscriptionData[0].post_content,
        created_at: subscriptionData[0].last_updated_at,
        secret_identity: {
          avatar: subscriptionData[0].secret_identity_avatar!,
          name: subscriptionData[0].secret_identity_name!,
          color: subscriptionData[0].secret_identity_color || undefined,
          accessory: subscriptionData[0].secret_identity_accessory || undefined,
        },
        own: false,
        new: false,
        friend: false,
        total_comments_amount: 0,
        new_comments_amount: 0,
        tags: {
          whisper_tags: [],
          index_tags: [],
          category_tags: [],
          content_warnings: [],
        },
      },
    ],
  };

  res.status(200).json(response);
  cache().hSet(
    CacheKeys.SUBSCRIPTION,
    subscriptionExternalId,
    stringify(response)
  );
});

export default router;
