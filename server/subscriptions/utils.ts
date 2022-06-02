import * as threadEvents from "handlers/events/threads";

const getDiscordWebhookMessage = ({
  subscriptionNames,
  eventPayload,
}: {
  subscriptionNames: string[];
  eventPayload: threadEvents.EventToPayload[keyof threadEvents.EventToPayload];
}) => {
  const boardSlug =
    "boardSlug" in eventPayload
      ? eventPayload.boardSlug
      : eventPayload.thread.parent_board_slug;
  const targetPost =
    "thread" in eventPayload ? eventPayload.thread.posts[0] : eventPayload.post;
  // TODO: add parent realm slug to thread
  const threadUrl = `https://v0.boba.social/!${boardSlug}/thread/${targetPost.parent_thread_id}`;
  const postUrl = `${threadUrl}/${targetPost.id}`;
  const message = `Your "${subscriptionNames.join(
    ", "
  )}" subscription has updated!\n${
    "post" in eventPayload ? postUrl : threadUrl
  }`;
  return {
    content: message,
    username: targetPost.secret_identity.name,
    avatar_url: targetPost.secret_identity.avatar,
  };
};

const getRestWebhookPayload = ({
  eventPayload,
}: {
  eventPayload: threadEvents.EventToPayload[keyof threadEvents.EventToPayload];
}) => {
  switch (eventPayload.eventType) {
    case threadEvents.EVENT_TYPES.THREAD_CREATED:
      return eventPayload.thread;
    case threadEvents.EVENT_TYPES.THREAD_UPDATED:
      return { contribution: eventPayload.post };
  }
};

export const getWebhookPayload = ({
  subscriptionNames,
  eventPayload,
  webhookHandlerType,
}: {
  subscriptionNames: string[];
  eventPayload: threadEvents.EventToPayload[keyof threadEvents.EventToPayload];
  webhookHandlerType: "rest" | "discord";
}) => {
  switch (webhookHandlerType) {
    case "discord":
      return getDiscordWebhookMessage({
        subscriptionNames,
        eventPayload,
      });
    case "rest":
      return getRestWebhookPayload({
        eventPayload,
      });
  }
};
