import * as uuid from "uuid";

import { BOBATAN_USER_ID, ZODIAC_KILLER_USER_ID } from "test/data/auth";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

import { CHARACTER_TO_MAIM_POST_ID } from "test/data/posts";
import { EventEmitter } from "events";
import request from "supertest";
import router from "../../routes";

jest.mock("handlers/auth");
jest.mock("server/db-pool");
jest.mock("server/cache");
jest.mock("uuid", () => ({
  __esModule: true,
  // @ts-ignore
  ...jest.requireActual("uuid"),
}));

describe("Test commenting on post REST API", () => {
  const server = startTestServer(router);

  // TODO: check the documentation for this endpoint, pretty sure I went down waaaay the wrong route because the real res body is much simpler than what I had put together
  const testCommentBody = {
    contents: ['[{"insert":"HEY I HAVE SOMETHING TO SAY"}]'],
    forceAnonymous: false,
    reply_to_comment_id: null,
  };

  // TODO: find out if we should allow an empty array of contents through - this wasn't what I actually needed to test for the BadRequest400Error test, but I was surprised that it didn't throw an error - is there any problem posed by empty contents?
  const emptyTestCommentBody = { ...testCommentBody, contents: [] };

  const nonArrayContentsTestCommentBody = {
    ...testCommentBody,
    contents: "hey what are you going to do with this string I wonder",
  };

  test("doesn't allow commenting on a post when logged out", async () => {
    await wrapWithTransaction(async () => {
      const res = await request(server.app)
        .post(`/${CHARACTER_TO_MAIM_POST_ID}/comments`)
        .send(testCommentBody);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        message: "No authenticated user found.",
      });
    });
  });

  test("doesn't allow commenting on a post when user not a member of realm", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(ZODIAC_KILLER_USER_ID);
      const res = await request(server.app)
        .post(`/${CHARACTER_TO_MAIM_POST_ID}/comments`)
        .send(testCommentBody);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        message: "User does not have required permissions for realm operation.",
      });
    });
  });

  test("allows commenting on a post when logged in", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const commentId = "e1a0230c-da57-4703-8bab-54c12494e8b1";
      jest.spyOn(uuid, "v4").mockReturnValueOnce(commentId);
      // TODO: figure out if this should follow the same pattern as testing the thread updates in the the contribution reply test, then figure out how to do it (first attempt had the contribution from before coming through, which doesn't seem like what we'd expect)
      const mockedEmit = jest.spyOn(EventEmitter.prototype, "emit");
      const res = await request(server.app)
        .post(`/${CHARACTER_TO_MAIM_POST_ID}/comments`)
        .send(testCommentBody);

      const expectedResponse = {
        comments: [
          {
            id: commentId,
            parent_comment_id: null,
            chain_parent_id: null,
            parent_post_id: CHARACTER_TO_MAIM_POST_ID,
            created_at: expect.any(String),
            content: '[{"insert":"HEY I HAVE SOMETHING TO SAY"}]',
            secret_identity: {
              name: "Old Time-y Anon",
              avatar:
                "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2F5c2c3867-2323-4209-8bd4-9dfcc88808f3%2Fd931f284-5c22-422d-9343-e509cfb44ffc.png?alt=media&token=94e52fff-4e6b-4110-94c3-90b8800f541c",
              color: null,
              accessory:
                "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
            },
            user_identity: { name: "bobatan", avatar: "/bobatan.png" },
            friend: false,
            own: true,
            new: true,
          },
        ],
      };

      expect(res.status).toBe(200);
      expect(res.body).toEqual(expectedResponse);
    });
  });

  test.todo("allows a commenting as a reply to another comment");
  test.todo("allows posting multiple comments at once");

  test("if the request's comment contents is not an array, throws a bad request error", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .post(`/${CHARACTER_TO_MAIM_POST_ID}/comments`)
        .send(nonArrayContentsTestCommentBody);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: "Received non-array type as contents of comments.",
      });
    });
  });

  // for this test, mock the db response
  test.todo(
    "if nothing comes back from the attempt to post a new comment, throws a 500"
  );
});
