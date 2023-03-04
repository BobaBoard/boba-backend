import * as postQueries from "../../queries";
import * as uuid from "uuid";

import { BOBATAN_USER_ID, ZODIAC_KILLER_USER_ID } from "test/data/auth";
import {
  CHARACTER_TO_MAIM_POST_ID,
  KERMIT_FRIEND_COMMENT_ID,
} from "test/data/posts";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

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

  // TODO: update the documentation for this endpoint to reflect exactly what is required - currently it describes needing the full shape of a Comment, but what will happen is the query will put all that together from context and respond with what it made
  const testCommentBody = {
    contents: ['[{"insert":"HEY I HAVE SOMETHING TO SAY"}]'],
    forceAnonymous: false,
    reply_to_comment_id: null,
  };

  const testAnonCommentBody = {
    ...testCommentBody,
    forceAnonymous: true,
  };

  const testMultiCommentBody = {
    ...testCommentBody,
    contents: [
      '[{"insert":"I have a few things to say"}]',
      '[{"insert":"and they will appear in a chain"}]',
      '[{"insert":"because I am adding them all at once"}]',
    ],
  };

  const testReplyCommentBody = {
    contents: ['[{"insert":"society for maiming muppets when?"}]'],
    forceAnonymous: false,
    reply_to_comment_id: KERMIT_FRIEND_COMMENT_ID,
  };

  const emptyArrayTestCommentBody = { ...testCommentBody, contents: [] };

  const nonArrayContentsTestCommentBody = {
    ...testCommentBody,
    contents: "hey what are you going to do with this string I wonder",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  test("also allows commenting with forceAnonymous set to true", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const commentId = "e1a0230c-da57-4703-8bab-54c12494e8b1";
      jest.spyOn(uuid, "v4").mockReturnValueOnce(commentId);

      const res = await request(server.app)
        .post(`/${CHARACTER_TO_MAIM_POST_ID}/comments`)
        .send(testAnonCommentBody);

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

  test("allows posting multiple comments at once", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);

      const comment1Id = "a408cb1f-0d3c-43a8-97aa-784fabc281b9";
      const comment2Id = "0af5d8ca-170d-4d29-b711-8fe7712289fc";
      const comment3Id = "312b17ac-f430-4335-a6b0-b74081973eff";
      jest.spyOn(uuid, "v4").mockReturnValueOnce(comment1Id);
      jest.spyOn(uuid, "v4").mockReturnValueOnce(comment2Id);
      jest.spyOn(uuid, "v4").mockReturnValueOnce(comment3Id);

      const res = await request(server.app)
        .post(`/${CHARACTER_TO_MAIM_POST_ID}/comments`)
        .send(testMultiCommentBody);

      const expectedResponse = {
        comments: [
          {
            id: comment1Id,
            parent_comment_id: null,
            chain_parent_id: null,
            parent_post_id: CHARACTER_TO_MAIM_POST_ID,
            created_at: expect.any(String),
            content: '[{"insert":"I have a few things to say"}]',
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
          {
            id: comment2Id,
            parent_comment_id: null,
            chain_parent_id: comment1Id,
            parent_post_id: CHARACTER_TO_MAIM_POST_ID,
            created_at: expect.any(String),
            content: '[{"insert":"and they will appear in a chain"}]',
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
          {
            id: comment3Id,
            parent_comment_id: null,
            chain_parent_id: comment2Id,
            parent_post_id: CHARACTER_TO_MAIM_POST_ID,
            created_at: expect.any(String),
            content: '[{"insert":"because I am adding them all at once"}]',
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

  test("allows a commenting as a reply to another comment", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const commentId = "f2v1349d-da57-4703-8bab-54c12494e8b1";
      jest.spyOn(uuid, "v4").mockReturnValueOnce(commentId);
      const res = await request(server.app)
        .post(`/${CHARACTER_TO_MAIM_POST_ID}/comments`)
        .send(testReplyCommentBody);

      const expectedResponse = {
        comments: [
          {
            id: commentId,
            parent_comment_id: KERMIT_FRIEND_COMMENT_ID,
            chain_parent_id: null,
            parent_post_id: CHARACTER_TO_MAIM_POST_ID,
            created_at: expect.any(String),
            content: '[{"insert":"society for maiming muppets when?"}]',
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

  test("does not write to the db when the comment's content array is empty", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);

      // spy on whatever query is making the actual DB write; NOTE: tightly coupled to the queries.ts file; this check may no longer be useful if there are changes there
      const commentTransactionSpy = jest.spyOn(
        postQueries,
        "postNewCommentWithTransaction"
      );

      const res = await request(server.app)
        .post(`/${CHARACTER_TO_MAIM_POST_ID}/comments`)
        .send(emptyArrayTestCommentBody);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        comments: [],
      });
      expect(commentTransactionSpy).not.toHaveBeenCalled();
    });
  });

  test("if the attempt to post a comment comes back falsy, throws a 500", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);

      // spy on the function that gives us the db response; NOTE: tightly coupled to the queries.ts file; this check may no longer be useful if there are changes there
      jest
        .spyOn(postQueries, "postNewCommentChain")
        .mockResolvedValueOnce(false);

      const res = await request(server.app)
        .post(`/${CHARACTER_TO_MAIM_POST_ID}/comments`)
        .send(testCommentBody);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({});
    });
  });
});
