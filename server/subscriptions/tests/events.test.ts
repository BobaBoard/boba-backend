import {
  AIBA_SUBSCRIPTION_ID,
  AIBA_SUBSCRIPTION_WEBHOOK,
  AIBA_THREAD_ID,
  BLOOD_AND_BRUISES_SUBSCRIPTION_ID,
  BLOOD_AND_BRUISES_SUBSCRIPTION_WEBHOOK,
  BLOOD_SUBSCRIPTION_ID,
  BLOOD_SUBSCRIPTION_WEBHOOK,
} from "test/data/subscriptions";
import {
  CREATE_GORE_THREAD_RESPONSE,
  FAVORITE_CHARACTER_THREAD,
} from "test/data/threads";
import { CacheKeys, cache } from "server/cache";
import {
  EVENT_TYPES as THREAD_EVENT_TYPES,
  emit as threadEventsEmit,
} from "handlers/events/threads";
import { registerAll, unregisterAll } from "../events";

import { Thread } from "types/open-api/generated";
import axios from "axios";
import { mocked } from "jest-mock";

jest.mock("axios", () => ({
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));
jest.mock("server/cache");

// TODO: remove this hack once we have time to figure out how to test async webhook
// calling
const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

describe("Test subscription updates", () => {
  beforeAll(() => {
    registerAll();
  });
  afterAll(() => {
    unregisterAll();
  });
  afterEach(() => {
    // TODO: investigate why this is needed here. Maybe it's only needed when running the tests in filtered mode?
    mocked(axios.post).mockClear();
  });

  test("should trigger multiple webhooks when creating a +blood thread in !gore", async () => {
    const createdThread: Thread = {
      ...FAVORITE_CHARACTER_THREAD,
      posts: [
        {
          ...FAVORITE_CHARACTER_THREAD.posts[0],
          secret_identity: {
            name: "GoreMaster5000",
            avatar: "avatar_url",
          },
          tags: {
            ...FAVORITE_CHARACTER_THREAD.posts[0].tags,
            category_tags: ["blood"],
          },
        },
      ],
      comments: {},
    };

    threadEventsEmit(THREAD_EVENT_TYPES.THREAD_CREATED, {
      thread: createdThread,
    });

    await sleep(100);
    expect(axios.post).toHaveBeenCalledTimes(2);
    expect(mocked(axios.post).mock.calls).toContainEqual([
      BLOOD_AND_BRUISES_SUBSCRIPTION_WEBHOOK,
      {
        avatar_url: "avatar_url",
        content: `Your "blood & bruises" subscription has updated!\nhttps://v0.boba.social/!gore/thread/${createdThread.id}`,
        username: "GoreMaster5000",
      },
    ]);
    expect(mocked(axios.post).mock.calls).toContainEqual([
      BLOOD_SUBSCRIPTION_WEBHOOK,
      createdThread,
    ]);

    expect(cache().hDel).toBeCalledTimes(2);
    expect(cache().hDel).toBeCalledWith(
      CacheKeys.SUBSCRIPTION,
      BLOOD_AND_BRUISES_SUBSCRIPTION_ID
    );
    expect(cache().hDel).toBeCalledWith(
      CacheKeys.SUBSCRIPTION,
      BLOOD_SUBSCRIPTION_ID
    );
  });

  test("should trigger webhook when updating subscribed thread with given category", async () => {
    const newContributionId = "08e12399-3f53-460d-afd9-9cb370aa9e59";

    threadEventsEmit(THREAD_EVENT_TYPES.THREAD_UPDATED, {
      boardSlug: "memes",
      post: {
        ...CREATE_GORE_THREAD_RESPONSE.posts[0],
        id: newContributionId,
        parent_thread_id: AIBA_THREAD_ID,
        secret_identity: {
          name: "GoreMaster5000",
          avatar: "avatar_url",
        },
        tags: {
          ...CREATE_GORE_THREAD_RESPONSE.posts[0].tags,
          category_tags: ["aiba"],
        },
      },
    });

    await sleep(100);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(mocked(axios.post)).toBeCalledWith(AIBA_SUBSCRIPTION_WEBHOOK, {
      avatar_url: expect.any(String),
      content: `Your "aiba!" subscription has updated!\nhttps://v0.boba.social/!memes/thread/${AIBA_THREAD_ID}/${newContributionId}`,
      username: expect.any(String),
    });

    expect(cache().hDel).toBeCalledTimes(1);
    // aiba subscription
    expect(cache().hDel).toBeCalledWith(
      CacheKeys.SUBSCRIPTION,
      AIBA_SUBSCRIPTION_ID
    );
  });
});
