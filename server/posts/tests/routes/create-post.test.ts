import * as uuid from "uuid";

import { CacheKeys, cache } from "server/cache";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

import { BOBATAN_USER_ID } from "test/data/auth";
import { CHARACTER_TO_MAIM_POST_ID } from "test/data/posts";
import axios from "axios";
import { mocked } from "ts-jest/utils";
import request from "supertest";
import router from "../../routes";

jest.mock("handlers/auth");
jest.mock("server/db-pool");
jest.mock("server/cache");
jest.mock("axios", () => ({
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));
jest.mock("uuid", () => ({
  __esModule: true,
  // @ts-ignore
  ...jest.requireActual("uuid"),
}));

// TODO: remove this hack once the webhook function is better implemented.
const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

describe("Test creating new post REST API", () => {
  const server = startTestServer(router);

  test("doesn't allow replying to post when logged out", async () => {
    await wrapWithTransaction(async () => {
      const res = await request(server.app)
        .post(`/${CHARACTER_TO_MAIM_POST_ID}/contributions`)
        .send({
          content: "this is a new contribution",
          index_tags: [],
          category_tags: [],
          content_warnings: ["new_warning_1"],
          whisper_tags: [],
        });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        message: "No authenticated user found.",
      });
    });
  });

  test("allows replying to post when logged out", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const newContributionId = "ca62bbb7-1916-4aa6-8796-dc44588afc40";
      jest.spyOn(uuid, "v4").mockReturnValueOnce(newContributionId);
      const res = await request(server.app)
        .post(`/${CHARACTER_TO_MAIM_POST_ID}/contributions`)
        .send({
          content: "this is a new contribution",
          index_tags: [],
          category_tags: [],
          content_warnings: ["new_warning_1"],
          whisper_tags: [],
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        contribution: {
          comments: [],
          content: "this is a new contribution",
          created_at: expect.any(String),
          friend: false,
          id: newContributionId,
          new: true,
          new_comments_amount: 0,
          own: true,
          parent_post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
          secret_identity: {
            accessory:
              "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
            avatar:
              "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
            color: null,
            name: "Old Time-y Anon",
          },
          tags: {
            category_tags: [],
            content_warnings: ["new_warning_1"],
            index_tags: [],
            whisper_tags: [],
          },
          total_comments_amount: 0,
          user_identity: {
            avatar: "/bobatan.png",
            name: "bobatan",
          },
        },
      });
    });
  });

  test("should trigger webhook when updating subscription", async () => {
    const AIBA_THREAD_STARTER_POST_ID = "b2c57275-512e-4821-8cf8-b3ac76e1e044";
    const AIBA_THREAD_ID = "2765f36a-b4f9-4efe-96f2-cb34f055d032";
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const newContributionId = "ca62bbb7-1916-4aa6-8796-dc44588afc40";
      jest.spyOn(uuid, "v4").mockReturnValueOnce(newContributionId);
      const res = await request(server.app)
        .post(`/${AIBA_THREAD_STARTER_POST_ID}/contributions`)
        .send({
          content: "this is a new contribution",
          index_tags: [],
          category_tags: ["aiba"],
          content_warnings: ["new_warning_1"],
          whisper_tags: [],
        });

      expect(res.status).toBe(200);
      await sleep(200);
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(mocked(axios.post)).toBeCalledWith(
        "http://localhost:4200/hooks/aiba",
        {
          avatar_url: expect.any(String),
          content: `Your "aiba!" subscription has updated!\nhttps://v0.boba.social/!memes/thread/${AIBA_THREAD_ID}/${newContributionId}`,
          username: expect.any(String),
        }
      );

      expect(cache().hdel).toBeCalledTimes(1);
      // aiba subscription
      expect(cache().hdel).toBeCalledWith(
        CacheKeys.SUBSCRIPTION,
        "a87800a6-21e5-46dd-a979-a901cdcea563"
      );
    });
  });
});
