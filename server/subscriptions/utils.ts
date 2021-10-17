import { CacheKeys, cache } from "../cache";
import {
  getTriggeredThreadsSubscriptions,
  getWebhooksForSubscriptions,
} from "./queries";

import axios from "axios";
import debug from "debug";

const error = debug("bobaserver:subscriptions:utils-error");
const log = debug("bobaserver:subscriptions:utils-log");

export const maybeUpdateSubscriptionsOnThreadChange = async ({
  threadId,
  postId,
  boardSlug,
  secretIdentity,
  categoryNames,
}: {
  threadId: string;
  postId?: string;
  boardSlug: string;
  categoryNames: string[];
  secretIdentity: {
    name: string;
    avatar: string;
    color?: string;
    accessory?: string;
  };
}) => {
  const triggeredSubscriptions = await getTriggeredThreadsSubscriptions({
    threadId,
    categoryNames,
  });

  if (!triggeredSubscriptions || triggeredSubscriptions.length == 0) {
    return;
  }

  const triggeredSubscriptionsIds = triggeredSubscriptions.map(
    (subscription) => subscription.string_id
  );

  log(`Triggered subscription ids: ${triggeredSubscriptionsIds}`);
  // Invalidate cached subscriptions that have updated
  await Promise.all(
    triggeredSubscriptionsIds.map((subscriptionId) =>
      cache().hdel(CacheKeys.SUBSCRIPTION, subscriptionId)
    )
  );

  const webhooks = await getWebhooksForSubscriptions({
    subscriptions: triggeredSubscriptionsIds,
  });
  log(`Found webhooks: %O`, webhooks);

  if (webhooks && webhooks.length > 0) {
    const threadUrl = `https://v0.boba.social/!${boardSlug}/thread/${threadId}${
      postId ? "/" + postId : ""
    }`;
    webhooks.forEach(async ({ webhook, subscription_ids }) => {
      const subscriptionNames = subscription_ids.map(
        (subscription_id) =>
          triggeredSubscriptions.find(
            (subscriptionData) => subscriptionData.string_id == subscription_id
          )?.name
      );
      const message = `Your "${subscriptionNames.join(
        ", "
      )}" subscription has updated!\n${threadUrl}`;

      axios
        .post(webhook, {
          content: message,
          username: secretIdentity.name,
          avatar_url: secretIdentity.avatar,
        })
        .catch(() => {
          error(`Error while posting to webhook ${webhook}`);
        });
    });
  }
};
