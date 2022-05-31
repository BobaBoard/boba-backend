import * as threadEvents from "handlers/events/threads";

import { CacheKeys, cache } from "server/cache";

import axios from "axios";
import { getTriggeredWebhooks } from "server/threads/queries";
import { maybeUpdateSubscriptionsOnThreadChange } from "./utils";

threadEvents.register(
  threadEvents.EVENT_TYPES.THREAD_CREATED,
  async ({ thread }) => {
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
  }
);

threadEvents.register(
  threadEvents.EVENT_TYPES.THREAD_UPDATED,
  async ({ boardSlug, post }) => {
    await maybeUpdateSubscriptionsOnThreadChange({
      threadId: post.parent_thread_id,
      postId: post.id,
      boardSlug,
      secretIdentity: post.secret_identity,
      categoryNames: post.tags?.category_tags,
    });
  }
);
