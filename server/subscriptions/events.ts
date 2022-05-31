import * as threadEvents from "handlers/events/threads";

import { CacheKeys, cache } from "server/cache";

import axios from "axios";
import { getTriggeredWebhooks } from "server/threads/queries";
import { maybeUpdateSubscriptionsOnThreadChange as maybeUpdateSubscriptionsOnThreadChangeUtils } from "./utils";

const maybeUpdateSubscriptionsOnThreadCreated = async ({
  thread,
}: threadEvents.ThreadCreatedPayload) => {
  const webhooks = await getTriggeredWebhooks({
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
  await maybeUpdateSubscriptionsOnThreadChangeUtils({
    threadId: post.parent_thread_id,
    postId: post.id,
    boardSlug,
    secretIdentity: post.secret_identity,
    categoryNames: post.tags?.category_tags,
  });
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
