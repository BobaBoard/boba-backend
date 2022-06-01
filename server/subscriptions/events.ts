import * as threadEvents from "handlers/events/threads";

import { CacheKeys, cache } from "server/cache";
import {
  getTriggeredThreadCreatedWebhooks,
  getTriggeredThreadsSubscriptions,
  getWebhooksForSubscriptions,
} from "./queries";

import axios from "axios";
import debug from "debug";

const error = debug("bobaserver:subscriptions:utils-error");
const log = debug("bobaserver:subscriptions:utils-log");

const maybeUpdateSubscriptionsOnThreadCreated = async ({
  thread,
}: threadEvents.ThreadCreatedPayload) => {
  const webhooks = await getTriggeredThreadCreatedWebhooks({
    slug: thread.parent_board_slug,
    categories: thread.posts[0].tags?.category_tags,
  });
  if (webhooks && webhooks.length > 0) {
    // TODO: add parent realm slug to thread
    const threadUrl = `https://v0.boba.social/!${thread.parent_board_slug}/thread/${thread.id}`;
    webhooks.forEach(
      async ({ webhook, subscriptionNames, subscriptionIds }) => {
        await Promise.all(
          subscriptionIds.map((subscriptionId) =>
            cache().hdel(CacheKeys.SUBSCRIPTION, subscriptionId)
          )
        );
        const message = `Your "${subscriptionNames.join(
          ", "
        )}" subscription has updated!\n${threadUrl}`;
        axios.post(webhook, {
          content: message,
          username: thread.posts[0].secret_identity.name,
          avatar_url: thread.posts[0].secret_identity.avatar,
        });
      }
    );
  }
};

const maybeUpdateSubscriptionsOnThreadChange = async ({
  boardSlug,
  post,
}: threadEvents.ThreadUpdatedPayload) => {
  const triggeredSubscriptions = await getTriggeredThreadsSubscriptions({
    threadId: post.parent_thread_id,
    categoryNames: post.tags?.category_tags,
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
    const threadUrl = `https://v0.boba.social/!${boardSlug}/thread/${
      post.parent_thread_id
    }${post.id ? "/" + post.id : ""}`;
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
          username: post.secret_identity.name,
          avatar_url: post.secret_identity.avatar,
        })
        .catch(() => {
          error(`Error while posting to webhook ${webhook}`);
        });
    });
  }
};

// TODO: figure out this type
type EventsWithHandlers<
  T extends threadEvents.EVENT_TYPES = threadEvents.EVENT_TYPES
> = [T, (eventPayload: threadEvents.EventToPayload[T]) => void];

const EVENTS_WITH_HANDLERS: EventsWithHandlers[] = [
  [
    threadEvents.EVENT_TYPES.THREAD_CREATED,
    maybeUpdateSubscriptionsOnThreadCreated,
  ],
  [
    threadEvents.EVENT_TYPES.THREAD_UPDATED,
    maybeUpdateSubscriptionsOnThreadChange,
  ],
];

export const registerAll = () => {
  EVENTS_WITH_HANDLERS.forEach(([eventType, handler]) => {
    threadEvents.register(eventType, handler);
  });
};

export const unregisterAll = () => {
  EVENTS_WITH_HANDLERS.forEach(([eventType, handler]) => {
    threadEvents.register(eventType, handler);
  });
};
