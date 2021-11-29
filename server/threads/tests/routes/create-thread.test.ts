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
        .post(`/${GORE_BOARD_ID}/create`)
        .send(CREATE_GORE_THREAD_BASE_REQUEST);

      expect(res.status).toBe(401);
      expect(res.body).toEqual<GenericResponse>(ENSURE_LOGGED_IN_NO_TOKEN);
    });
  });

  // TODO: don't know how to generate invalid token
  test("TODO: should fail when user has invalid authentication", async () => {
    //await wrapWithTransaction(async () => {
    //const res = await request(server.app)
    //  .post(`/${GORE_BOARD_ID}/create`)
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
    //    .post(`/${GORE_BOARD_ID}/create`)
    //    .send(CREATE_GORE_THREAD_BASE_REQUEST);
    //  expect(res.status).toBe(403);
    //});
  });

  test("should fail when board does not exist", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .post(`/${NULL_ID}/create`)
        .send(CREATE_GORE_THREAD_BASE_REQUEST);

      expect(res.status).toBe(404);
      expect(res.body).toEqual(NULL_BOARD_NOT_FOUND);
    });
  });

  // No request body validation for /create yet
  test("TODO: should fail if request body is invalid", async () => {
    //await wrapWithTransaction(async () => {
    //  setLoggedInUser(BOBATAN_USER_ID);
    //  const res = await request(server.app)
    //    .post(`/${NULL_ID}/create`)
    //    .send(CREATE_GORE_THREAD_BASE_REQUEST);
    //  expect(res.status).toBe(422);
  });

  // TODO: figure out why this fails on CI and remove the wrapping describe
  describe("ci-disable", () => {
    test("should create thread", async () => {
      await wrapWithTransaction(async () => {
        setLoggedInUser(BOBATAN_USER_ID);
        const res = await request(server.app)
          .post(`/${GORE_BOARD_ID}/create`)
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
        .post(`/${GORE_BOARD_ID}/create`)
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
        .post(`/${GORE_BOARD_ID}/create`)
        .send({
          ...CREATE_GORE_THREAD_BASE_REQUEST,
          identityId: GORE_MASTER_IDENTITY_ID,
        });

      expect(res.status).toBe(403);
    });
  });
});
