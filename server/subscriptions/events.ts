import * as threadEvents from "handlers/events/threads";

import { CacheKeys, cache } from "server/cache";
import {
  getTriggeredBoardSubscriptions,
  getTriggeredThreadsSubscriptions,
  getWebhooksForSubscriptions,
} from "./queries";

import axios from "axios";
import debug from "debug";
import { getWebhookPayload } from "./utils";

const log = debug("bobaserver:subscriptions:events-log");

const publishSubscriptionsUpdates = async ({
  subscriptions,
  eventPayload,
}: {
  subscriptions: {
    name: string;
    id: string;
  }[];
  eventPayload: threadEvents.EventToPayload[keyof threadEvents.EventToPayload];
}) => {
  log(
    `Triggered subscription ids: ${subscriptions.map((s) => s.id).join(", ")}`
  );

  const webhooks = await getWebhooksForSubscriptions({
    subscriptionIds: subscriptions.map((s) => s.id),
  });
  if (webhooks && webhooks.length > 0) {
    log(webhooks);
    webhooks.forEach(
      async ({ webhook, webhookHandlerType, subscriptionIds }) => {
        await Promise.all(
          subscriptionIds.map((subscriptionId) =>
            cache().hDel(CacheKeys.SUBSCRIPTION, subscriptionId)
          )
        );
        axios.post(
          webhook,
          getWebhookPayload({
            webhookHandlerType,
            subscriptionNames: subscriptionIds.map(
              (subscriptionId) =>
                subscriptions.find((s) => s.id === subscriptionId)?.name
            ),
            eventPayload,
          })
        );
      }
    );
  }
};

const maybeUpdateSubscriptionsOnThreadCreated = async (
  eventPayload: threadEvents.ThreadCreatedPayload
) => {
  const triggeredSubscriptions = await getTriggeredBoardSubscriptions({
    boardExternalId: eventPayload.thread.parent_board_id,
    categories: eventPayload.thread.posts[0].tags?.category_tags,
  });

  if (triggeredSubscriptions?.length == 0) {
    return;
  }
  publishSubscriptionsUpdates({
    subscriptions: triggeredSubscriptions,
    eventPayload,
  });
};

const maybeUpdateSubscriptionsOnThreadChange = async (
  eventPayload: threadEvents.ThreadUpdatedPayload
) => {
  const triggeredSubscriptions = await getTriggeredThreadsSubscriptions({
    threadExternalId: eventPayload.post.parent_thread_id,
    categoryNames: eventPayload.post.tags?.category_tags,
  });

  if (triggeredSubscriptions?.length == 0) {
    return;
  }

  publishSubscriptionsUpdates({
    subscriptions: triggeredSubscriptions,
    eventPayload,
  });
};

type EventsWithHandlers = {
  [eventType in threadEvents.EVENT_TYPES]: (
    e: threadEvents.EventToPayload[eventType]
  ) => void;
};

const EVENTS_WITH_HANDLERS: EventsWithHandlers = {
  [threadEvents.EVENT_TYPES.THREAD_CREATED]:
    maybeUpdateSubscriptionsOnThreadCreated,
  [threadEvents.EVENT_TYPES.THREAD_UPDATED]:
    maybeUpdateSubscriptionsOnThreadChange,
};

export const registerAll = () => {
  Object.entries(EVENTS_WITH_HANDLERS).forEach(([eventType, handler]) => {
    // @ts-ignore Type safety is given by the EVENTS_WITH_HANDLERS definition
    threadEvents.register(eventType, handler);
  });
};

export const unregisterAll = () => {
  Object.entries(EVENTS_WITH_HANDLERS).forEach(([eventType, handler]) => {
    // @ts-ignore Type safety is given by the EVENTS_WITH_HANDLERS definition
    threadEvents.register(eventType, handler);
  });
};
