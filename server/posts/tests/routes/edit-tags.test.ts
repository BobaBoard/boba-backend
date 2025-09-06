jest.mock("server/db-pool.js");
jest.mock("handlers/auth.js");

import {
  BOBATAN_USER_ID,
  ONCEST_USER_ID,
  SEXY_DADDY_USER_ID,
} from "test/data/auth.js";
import {
  CHARACTER_TO_MAIM_POST,
  CHARACTER_TO_MAIM_POST_ID,
} from "test/data/posts.js";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils.js";

import { ONCEST_USER_IDENTITY } from "test/data/user.js";
import request from "supertest";
import router from "../../routes.js";




describe("Test editing tags of post REST API", () => {
  const server = startTestServer(router);

  test("doesn't allow post editing when logged out", async () => {
    await wrapWithTransaction(async () => {
      const res = await request(server.app)
        .patch(`/${CHARACTER_TO_MAIM_POST_ID}/contributions`)
        .send({
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
  test("doesn't allow post editing when logged in as different user", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(SEXY_DADDY_USER_ID);
      const res = await request(server.app)
        .patch(`/${CHARACTER_TO_MAIM_POST_ID}/contributions`)
        .send({
          index_tags: ["new_index_tag"],
          category_tags: ["new_category_tag"],
          content_warnings: ["new_warning"],
          whisper_tags: ["new_whisper_tag"],
        });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        message: `User is not authorized to edit tags on this post.`,
      });
    });
  });

  test("doesn't allow post editing when tag type permission not explicitly granted", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .patch(`/${CHARACTER_TO_MAIM_POST_ID}/contributions`)
        .send({
          index_tags: ["new_index_tag"],
          category_tags: ["new_category_tag"],
          content_warnings: ["new_warning"],
          whisper_tags: ["new_whisper_tag"],
        });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        message: `User is not authorized to edit tags on this post.`,
      });
    });
  });
});

// TODO: I have no idea why but sometimes tests decide they should not
// pass on CI. In particular, either this or the other test that modifies
// the tags pass. The one that runs later does not insert the category tag
// in the db. I don't know why, and nothing helped.
// Periodically, try to remove this cause sometimes they start passing again.
describe("ci-disable", () => {
  const server = startTestServer(router);

  test("allows post editing when has correct permissions", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .patch(`/${CHARACTER_TO_MAIM_POST_ID}/contributions`)
        .send({
          index_tags: ["evil", "bobapost"],
          category_tags: ["new_category_tag"],
          content_warnings: ["new_warning"],
          whisper_tags: [],
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...CHARACTER_TO_MAIM_POST,
        friend: true,
        user_identity: ONCEST_USER_IDENTITY,
        // TODO: the total comments amount should be returned also in the other queries
        total_comments_amount: 3,
        tags: {
          ...CHARACTER_TO_MAIM_POST.tags,
          category_tags: ["new_category_tag"],
          content_warnings: ["new_warning"],
        },
      });
    });
  });
  test("allows post editing when logged in as owner", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(ONCEST_USER_ID);
      const res = await request(server.app)
        .patch(`/${CHARACTER_TO_MAIM_POST_ID}/contributions`)
        .send({
          index_tags: ["new_index_tag"],
          category_tags: ["new_category_tag"],
          content_warnings: ["new_warning"],
          whisper_tags: ["new_whisper_tag"],
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...CHARACTER_TO_MAIM_POST,
        // TODO: the total comments amount should be returned also in the other queries
        total_comments_amount: 3,
        new_comments_amount: 2,
        own: true,
        tags: {
          index_tags: ["new_index_tag"],
          category_tags: ["new_category_tag"],
          content_warnings: ["new_warning"],
          whisper_tags: ["new_whisper_tag"],
        },
        user_identity: ONCEST_USER_IDENTITY,
      });
    });
  });
});
