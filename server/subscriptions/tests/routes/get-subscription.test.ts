import { CacheKeys, cache } from "server/cache";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { AIBA_SUBSCRIPTION_ID } from "test/data/subscriptions";
import { BOBATAN_USER_ID } from "test/data/auth";
import { GenericResponse } from "types/rest/responses";
import { SubscriptionFeed } from "types/rest/subscriptions";
import { mocked } from "ts-jest/utils";
import request from "supertest";
import router from "../../routes";
import stringify from "fast-json-stable-stringify";

jest.mock("server/cache");
jest.mock("handlers/auth");

const AIBA_SUBSCRIPTION_RESULT: SubscriptionFeed = {
  cursor: {
    next: null,
  },
  subscription: {
    id: "a87800a6-21e5-46dd-a979-a901cdcea563",
    last_activity_at: "2020-08-22T03:36:18.00Z",
    name: "aiba!",
  },
  activity: [
    {
      id: "7f76ddaf-06f0-44fa-85d5-2e5ad5d447aa",
      parent_thread_id: "2765f36a-b4f9-4efe-96f2-cb34f055d032",
      created_at: "2020-08-22T03:36:18.00Z",
      content:
        '[{"insert":{"block-image":{"src":"https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmemes%2F2765f36a-b4f9-4efe-96f2-cb34f055d032%2F7707f104-044c-4111-b422-74e11ccef4a2?alt=media&token=7cdf3edb-0d63-467e-ade6-05447cc602c3","spoilers":false,"width":1920,"height":1080}}},{"insert":""}]',
      friend: false,
      new: false,
      own: false,
      parent_post_id: null,
      secret_identity: {
        name: null,
        avatar: null,
      },
      tags: {
        category_tags: [],
        content_warnings: [],
        index_tags: [],
        whisper_tags: [],
      },
      total_comments_amount: 0,
      new_comments_amount: 0,
    },
  ],
};

describe("Tests threads REST API", () => {
  const server = startTestServer(router);

  test("should return subscription data (logged out)", async () => {
    const res = await request(server.app).get(`/${AIBA_SUBSCRIPTION_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(AIBA_SUBSCRIPTION_RESULT);
  });

  test("should return 404 when subscription does not exist", async () => {
    const res = await request(server.app).get(`/this_id_does_not_exist`);
    expect(res.status).toBe(404);
  });

  test("Should cache subscription", async () => {
    const res = await request(server.app).get(`/${AIBA_SUBSCRIPTION_ID}`);

    expect(cache().hSet).toBeCalledWith(
      CacheKeys.SUBSCRIPTION,
      AIBA_SUBSCRIPTION_ID,
      stringify(AIBA_SUBSCRIPTION_RESULT)
    );
  });

  test("Should return subscription from cache", async () => {
    const cachedSubscription: SubscriptionFeed = {
      cursor: {
        next: null,
      },
      subscription: {
        id: "",
        last_activity_at: "2020-08-22T03:36:18.00Z",
        name: "this_is_the_cached_subscription",
      },
      activity: [
        {
          id: "",
          parent_thread_id: "",
          created_at: "2020-08-22T03:36:18.00Z",
          content: '[{"insert":""}]',
          friend: false,
          new: false,
          own: false,
          parent_post_id: null,
          secret_identity: {
            name: null,
            avatar: null,
          },
          tags: {
            category_tags: [],
            content_warnings: [],
            index_tags: [],
            whisper_tags: [],
          },
          total_comments_amount: 0,
          new_comments_amount: 0,
        },
      ],
    };
    mocked(cache().hGet).mockResolvedValueOnce(stringify(cachedSubscription));

    const res = await request(server.app).get(`/${AIBA_SUBSCRIPTION_ID}`);

    expect(cache().hGet).toBeCalledTimes(1);
    expect(cache().hGet).toBeCalledWith(
      CacheKeys.SUBSCRIPTION,
      AIBA_SUBSCRIPTION_ID
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual(cachedSubscription);
  });
});
