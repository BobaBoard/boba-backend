import { Contribution, Thread } from "types/open-api/generated/types";

import { EventEmitter } from "events";

export enum EVENT_TYPES {
  THREAD_CREATED = "THREAD_CREATED",
  THREAD_UPDATED = "THREAD_UPDATED",
}

export interface ThreadCreatedPayload {
  eventType: EVENT_TYPES.THREAD_CREATED;
  thread: Thread;
}

export interface ThreadUpdatedPayload {
  eventType: EVENT_TYPES.THREAD_UPDATED;
  boardSlug: string;
  post: Contribution;
}

export interface EventToPayload {
  [EVENT_TYPES.THREAD_CREATED]: ThreadCreatedPayload;
  [EVENT_TYPES.THREAD_UPDATED]: ThreadUpdatedPayload;
}

const emitter = new EventEmitter();
export const emit = <K extends EVENT_TYPES>(
  eventType: K,
  data: Omit<EventToPayload[K], "eventType">
) => {
  emitter.emit(eventType, {
    ...data,
    eventType,
  });
};

export const register = <K extends EVENT_TYPES>(
  eventType: K,
  callback: (data: EventToPayload[K]) => void
) => {
  emitter.on(eventType, callback);
};
