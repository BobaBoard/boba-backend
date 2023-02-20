import * as uuid from "uuid";

import {
  BOBATAN_USER_ID,
  GORE_MASTER_IDENTITY_ID,
  JERSEY_DEVIL_USER_ID,
  SEXY_DADDY_USER_ID,
} from "test/data/auth";
import { CREATE_GORE_THREAD_RESPONSE, NULL_ID } from "test/data/threads";
import { GORE_BOARD_ID, NULL_BOARD_NOT_FOUND } from "test/data/boards";
import {
  EVENT_TYPES as THREAD_EVENT_TYPES,
  ThreadCreatedPayload,
} from "handlers/events/threads";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

import { ENSURE_LOGGED_IN_NO_TOKEN } from "test/data/responses";
import { EventEmitter } from "events";
import { GenericResponse } from "types/rest/responses";
import { Thread } from "types/rest/threads";
import { mocked } from "ts-jest/utils";
import request from "supertest";
import router from "../../routes";

jest.mock("uuid", () => ({
  __esModule: true,
  // @ts-ignore
  ...jest.requireActual("uuid"),
}));

jest.mock("handlers/auth");
jest.mock("server/cache");
jest.mock("server/db-pool");
jest.mock("axios");

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

  test("should create thread", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const mockedEmit = jest.spyOn(EventEmitter.prototype, "emit");
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

      const threadCreatedCalls = mockedEmit.mock.calls.filter(
        (call) => call[0] === THREAD_EVENT_TYPES.THREAD_CREATED
      );
      expect(threadCreatedCalls.length).toBe(1);
      const threadCreatedCall = threadCreatedCalls[0];
      expect(threadCreatedCall[0]).toBe(THREAD_EVENT_TYPES.THREAD_CREATED);
      expect(threadCreatedCall[1]).toMatchObject<ThreadCreatedPayload>({
        eventType: THREAD_EVENT_TYPES.THREAD_CREATED,
        thread: CREATE_GORE_THREAD_RESPONSE,
      });
      mockedEmit.mockClear();
    });
  });

  test("should create thread as role", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const mockedEmit = jest.spyOn(EventEmitter.prototype, "emit");
      const res = await request(server.app)
        .post(`/${GORE_BOARD_ID}`)
        .send({
          ...CREATE_GORE_THREAD_BASE_REQUEST,
          identityId: GORE_MASTER_IDENTITY_ID,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(CREATE_GORE_THREAD_RESPONSE);

      const threadCreatedCalls = mockedEmit.mock.calls.filter(
        (call) => call[0] === THREAD_EVENT_TYPES.THREAD_CREATED
      );
      expect(threadCreatedCalls.length).toBe(1);
      const threadCreatedCall = threadCreatedCalls[0];
      expect(threadCreatedCall[0]).toBe(THREAD_EVENT_TYPES.THREAD_CREATED);
      expect(threadCreatedCall[1]).toMatchObject<ThreadCreatedPayload>({
        eventType: THREAD_EVENT_TYPES.THREAD_CREATED,
        thread: CREATE_GORE_THREAD_RESPONSE,
      });
      mockedEmit.mockClear();
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

  test("Does not create thread when user not a member of realm", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(JERSEY_DEVIL_USER_ID);
      const res = await request(server.app)
        .post(`/${GORE_BOARD_ID}`)
        .send(CREATE_GORE_THREAD_BASE_REQUEST);
      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        message: "User does not have required permissions for realm operation.",
      });
    });
  });
});
