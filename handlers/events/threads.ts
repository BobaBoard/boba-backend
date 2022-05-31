import { Post, Thread } from "types/rest/threads";

const events = require("events");

export enum EVENT_TYPES {
  THREAD_CREATED,
  THREAD_UPDATED,
}

interface ThreadCreatedPayload {
  thread: Thread;
}

interface ThreadUpdatedPayload {
  boardSlug: string;
  post: Post;
}

interface EventToPayload {
  [EVENT_TYPES.THREAD_CREATED]: ThreadCreatedPayload;
  [EVENT_TYPES.THREAD_UPDATED]: ThreadUpdatedPayload;
}

const emitter = new events.EventEmitter();
export const emit = <K extends EVENT_TYPES>(
  eventType: K,
  data: EventToPayload[K]
) => {
  emitter.emit(eventType, data);
};

export const register = <K extends EVENT_TYPES>(
  eventType: K,
  callback: (data: EventToPayload[K]) => void
) => {
  emitter.on(eventType, callback);
};
