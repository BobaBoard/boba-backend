import {
  BOBATAN_USER_ID,
  GORE_MASTER_IDENTITY_ID,
  SEXY_DADDY_USER_ID,
} from "test/data/auth";
import {
  CREATE_GORE_THREAD_RESPONSE,
  NULL_ID,
  NULL_THREAD_NOT_FOUND,
} from "test/data/threads";
import {
  ENSURE_LOGGED_IN_INVALID_TOKEN,
  ENSURE_LOGGED_IN_NO_TOKEN,
  ENSURE_THREAD_ACCESS_UNAUTHORIZED,
} from "test/data/responses";
import { GORE_BOARD_ID, NULL_BOARD_NOT_FOUND } from "test/data/boards";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

import { GenericResponse } from "types/rest/responses";
import { Thread } from "types/rest/threads";
import request from "supertest";
import router from "../../routes";

jest.mock("handlers/auth");
jest.mock("server/db-pool");

export const CREATE_GORE_THREAD_BASE_REQUEST = {
  content: '[{"insert":"Gore. Gore? Gore!"}]',
  forceAnonymous: false,
  defaultView: "thread",
  whisperTags: ["whisper"],
  indexTags: ["search"],
  contentWarnings: ["content notice"],
  categoryTags: ["filter"],
};

describe("Tests threads REST API - create", () => {
  const server = startTestServer(router);

  test("should fail when user is unauthenticated", async () => {
    await wrapWithTransaction(async () => {
      const res = await request(server.app)
        .post(`/${GORE_BOARD_ID}`)
        .send(CREATE_GORE_THREAD_BASE_REQUEST);

      expect(res.status).toBe(401);
      expect(res.body).toEqual<GenericResponse>(ENSURE_LOGGED_IN_NO_TOKEN);
    });
  });

  // TODO: don't know how to generate invalid token
  test("TODO: should fail when user has invalid authentication", async () => {
    //await wrapWithTransaction(async () => {
    //const res = await request(server.app)
    //  .post(`/${GORE_BOARD_ID}`)
    //  .send(CREATE_GORE_THREAD_BASE_REQUEST);
    //expect(res.status).toBe(401);
    //expect(res.body).toEqual<GenericResponse>(ENSURE_LOGGED_IN_INVALID_TOKEN);
    //});
  });

  // Currently no specific permission for creating a thread exists
  test("TODO: should fail when user does not have permissions", async () => {
    //await wrapWithTransaction(async () => {
    //  setLoggedInUser(BOBATAN_USER_ID);
    //  const res = await request(server.app)
    //    .post(`/${GORE_BOARD_ID}`)
    //    .send(CREATE_GORE_THREAD_BASE_REQUEST);
    //  expect(res.status).toBe(403);
    //});
  });

  test("should fail when board does not exist", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .post(`/${NULL_ID}`)
        .send(CREATE_GORE_THREAD_BASE_REQUEST);

      expect(res.status).toBe(404);
      expect(res.body).toEqual(NULL_BOARD_NOT_FOUND);
    });
  });

  // No request body validation for  yet
  test("TODO: should fail if request body is invalid", async () => {
    //await wrapWithTransaction(async () => {
    //  setLoggedInUser(BOBATAN_USER_ID);
    //  const res = await request(server.app)
    //    .post(`/${NULL_ID}`)
    //    .send(CREATE_GORE_THREAD_BASE_REQUEST);
    //  expect(res.status).toBe(422);
  });

  test("should create thread with accessory", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .post(`/${GORE_BOARD_ID}`)
        .send({
          ...CREATE_GORE_THREAD_BASE_REQUEST,
          accessoryId: "c82b99b4-9aa7-4792-8e6b-211edba5981e",
          identityId: "3df1d417-c36a-43dd-aaba-9590316ffc32",
        });

      const expectedStarter = {
        ...CREATE_GORE_THREAD_RESPONSE.starter,
        secret_identity: {
          name: "The Owner",
          accessory: "/420accessories/weed_hands.png",
          avatar:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F2df7dfb4-4c64-4370-8e74-9ee30948f05d?alt=media&token=26b16bef-0fd2-47b5-b6df-6cf2799010ca",
          color: "pink",
        },
      };
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject<Thread>({
        ...CREATE_GORE_THREAD_RESPONSE,
        starter: expectedStarter,
        posts: [expectedStarter],
      });
    });
  });

  // TODO: figure out why this fails on CI and remove the wrapping describe
  describe("ci-disable", () => {
    test("should create thread", async () => {
      await wrapWithTransaction(async () => {
        setLoggedInUser(BOBATAN_USER_ID);
        const res = await request(server.app)
          .post(`/${GORE_BOARD_ID}`)
          .send({
            content: '[{"insert":"Gore. Gore? Gore!"}]',
            forceAnonymous: false,
            defaultView: "thread",
            whisperTags: ["whisper"],
            indexTags: ["search"],
            contentWarnings: ["content notice"],
            categoryTags: ["filter"],
          });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject(CREATE_GORE_THREAD_RESPONSE);
      });
    });
  });

  test("should create thread as role", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .post(`/${GORE_BOARD_ID}`)
        .send({
          ...CREATE_GORE_THREAD_BASE_REQUEST,
          identityId: GORE_MASTER_IDENTITY_ID,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(CREATE_GORE_THREAD_RESPONSE);
    });
  });

  test("should fail creating thread as role when role is not owned", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(SEXY_DADDY_USER_ID);
      const res = await request(server.app)
        .post(`/${GORE_BOARD_ID}`)
        .send({
          ...CREATE_GORE_THREAD_BASE_REQUEST,
          identityId: GORE_MASTER_IDENTITY_ID,
        });

      expect(res.status).toBe(403);
    });
  });
});
