import {
  NULL_ID,
  NULL_THREAD_NOT_FOUND,
  CREATE_GORE_THREAD_REQUEST,
  CREATE_GORE_THREAD_RESPONSE,
} from "test/data/threads";

import { GORE_BOARD_ID, NULL_BOARD_NOT_FOUND } from "test/data/boards";

import {
  ENSURE_LOGGED_IN_NO_TOKEN,
  ENSURE_LOGGED_IN_INVALID_TOKEN,
  ENSURE_THREAD_ACCESS_UNAUTHORIZED,
} from "test/data/responses";

import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

import { BOBATAN_USER_ID } from "test/data/auth";
import { Thread } from "types/rest/threads";
import { GenericResponse } from "types/rest/responses";
import request from "supertest";
import router from "../../routes";

jest.mock("server/cache");
jest.mock("handlers/auth");
jest.mock("server/db-pool");

describe("Tests threads REST API - create", () => {
  const server = startTestServer(router);

  test("should fail when user is unauthenticated", async() => {
    await wrapWithTransaction(async () => {
      const res = await request(server.app)
        .post(`/${GORE_BOARD_ID}/create`)
        .send(CREATE_GORE_THREAD_REQUEST);

      expect(res.status).toBe(401);
      expect(res.body).toEqual<GenericResponse>(ENSURE_LOGGED_IN_NO_TOKEN);
    });
  });
  
  // TODO: don't know how to generate invalid token
  test("TODO: should fail when user has invalid authentication", async () => {
    //await wrapWithTransaction(async () => {
    //const res = await request(server.app)
    //  .post(`/${GORE_BOARD_ID}/create`)
    //  .send(CREATE_GORE_THREAD_REQUEST);

    //expect(res.status).toBe(401);
    //expect(res.body).toEqual<GenericResponse>(ENSURE_LOGGED_IN_INVALID_TOKEN);
    //});
  });

  // Currently no specific permission for creating a thread exists
	test("TODO: should fail when user does not have permissions", async() => {
    //await wrapWithTransaction(async () => {
    //  setLoggedInUser(BOBATAN_USER_ID);
    //  const res = await request(server.app)
    //    .post(`/${GORE_BOARD_ID}/create`)
    //    .send(CREATE_GORE_THREAD_REQUEST);

    //  expect(res.status).toBe(403);
    //});
	});
  
	test("should fail when board does not exist", async() => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .post(`/${NULL_ID}/create`)
        .send(CREATE_GORE_THREAD_REQUEST);

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
    //    .send(CREATE_GORE_THREAD_REQUEST);

    //  expect(res.status).toBe(422);
  });

	test("should create thread", async() => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .post(`/${GORE_BOARD_ID}/create`)
        .send(CREATE_GORE_THREAD_REQUEST);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(CREATE_GORE_THREAD_RESPONSE);
    });
	});
});
