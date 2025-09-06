import * as uuid from "uuid";

import { BOBATAN_USER_ID, ZODIAC_KILLER_USER_ID } from "test/data/auth.js";
import {
  EVENT_TYPES as THREAD_EVENT_TYPES,
  type ThreadUpdatedPayload,
} from "handlers/events/threads.js";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils.js";

import { CHARACTER_TO_MAIM_POST_ID } from "test/data/posts.js";
import type { Contribution } from "types/open-api/generated/types.js";
import { EventEmitter } from "events";
import { FAVORITE_CHARACTER_THREAD_ID } from "test/data/threads.js";
import request from "supertest";
import router from "../../routes.js";

jest.mock("handlers/auth");
jest.mock("server/db-pool");
jest.mock("server/cache");
jest.mock("uuid", () => ({
  __esModule: true,
  // @ts-ignore
  ...jest.requireActual("uuid"),
}));

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

  test("doesn't allow replying to post when user not a member of realm", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(ZODIAC_KILLER_USER_ID);
      const res = await request(server.app)
        .post(`/${CHARACTER_TO_MAIM_POST_ID}/contributions`)
        .send({
          content: "this is a new contribution",
          index_tags: [],
          category_tags: [],
          content_warnings: ["new_warning_1"],
          whisper_tags: [],
        });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        message: "User does not have required permissions for realm operation.",
      });
    });
  });

  test("allows replying to post with a new contribution when logged in", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const newContributionId = "ca62bbb7-1916-4aa6-8796-dc44588afc40";
      jest.spyOn(uuid, "v4").mockReturnValueOnce(newContributionId);
      const mockedEmit = jest.spyOn(EventEmitter.prototype, "emit");
      const res = await request(server.app)
        .post(`/${CHARACTER_TO_MAIM_POST_ID}/contributions`)
        .send({
          content: "this is a new contribution",
          index_tags: [],
          category_tags: [],
          content_warnings: ["new_warning_1"],
          whisper_tags: [],
        });

      // TODO: figure out why we're adding comments here and if we actually need it
      const expectedResponse: Contribution & { comments: [] } = {
        content: "this is a new contribution",
        comments: [],
        created_at: expect.any(String),
        friend: false,
        id: newContributionId,
        new: true,
        new_comments_amount: 0,
        own: true,
        parent_post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
        parent_thread_id: FAVORITE_CHARACTER_THREAD_ID,
        secret_identity: {
          accessory:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
          avatar:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2F5c2c3867-2323-4209-8bd4-9dfcc88808f3%2Fd931f284-5c22-422d-9343-e509cfb44ffc.png?alt=media&token=94e52fff-4e6b-4110-94c3-90b8800f541c",
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
      };
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        contribution: expectedResponse,
      });

      const threadUpdatedCalls = mockedEmit.mock.calls.filter(
        (call) => call[0] === THREAD_EVENT_TYPES.THREAD_UPDATED
      );
      expect(threadUpdatedCalls.length).toBe(1);
      const threadUpdatedCall = threadUpdatedCalls[0];
      expect(threadUpdatedCall[0]).toBe(THREAD_EVENT_TYPES.THREAD_UPDATED);
      expect(threadUpdatedCall[1]).toMatchObject<ThreadUpdatedPayload>({
        eventType: THREAD_EVENT_TYPES.THREAD_UPDATED,
        boardSlug: "gore",
        post: expectedResponse,
      });
    });
  });
});
