import {
  FAVORITE_CHARACTER_THREAD_ID,
  RESTRICTED_THREAD_ID,
  NULL_ID,
  NULL_THREAD_NOT_FOUND,
} from "test/data/threads";

import {
  ENSURE_LOGGED_IN_NO_TOKEN,
  ENSURE_LOGGED_IN_INVALID_TOKEN,
  ENSURE_THREAD_ACCESS_UNAUTHORIZED,
} from "test/data/responses";

import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { BOBATAN_USER_ID } from "test/data/auth";
import { Thread } from "types/rest/threads";
import { GenericResponse } from "types/rest/responses";
import request from "supertest";
import router from "../../routes";

jest.mock("handlers/auth");

describe("Tests threads REST API - hide", () => {
  const server = startTestServer(router);

  test("should hide thread", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).post(
      `/${FAVORITE_CHARACTER_THREAD_ID}/hide`
    );

    expect(res.status).toBe(200);
  });

  test("should fail when user is unauthenticated", async () => {
    const res = await request(server.app).post(
      `/${FAVORITE_CHARACTER_THREAD_ID}/hide`
    );

    expect(res.status).toBe(401);
    expect(res.body).toEqual<GenericResponse>(ENSURE_LOGGED_IN_NO_TOKEN);
  });

  // TODO: don't know how to generate invalid token
  test("TODO: should fail when user has invalid authentication", async () => {
    //const res = await request(server.app).post(
    //  `/${FAVORITE_CHARACTER_THREAD_ID}/hide`
    //);

    //expect(res.status).toBe(401);
    //expect(res.body).toEqual<GenericResponse>(ENSURE_LOGGED_IN_NO_TOKEN);
  });

  // TODO: permissions don't exist yet
  test("TODO: should fail when user is not authorized to access thread", async () => {
    //const res = await request(server.app).post(
    //  `/${FAVORITE_CHARACTER_THREAD_ID}/hide`
    //);

    //expect(res.status).toBe(403);
    //expect(res.body).toEqual<GenericResponse>(ENSURE_THREAD_ACCESS_UNAUTHORIZED);
  });

  test("should fail when thread does not exist", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).post(
      `/${NULL_ID}/hide`
    );

    expect(res.status).toBe(404);
    expect(res.body).toEqual<GenericResponse>(NULL_THREAD_NOT_FOUND);
  });
});

describe("Tests threads REST API - unhide", () => {
  const server = startTestServer(router);

  test("should unhide thread", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).delete(
      `/${FAVORITE_CHARACTER_THREAD_ID}/hide`
    );

    expect(res.status).toBe(200);
  });

  test("should fail when user is unauthenticated", async () => {
    const res = await request(server.app).delete(
      `/${FAVORITE_CHARACTER_THREAD_ID}/hide`
    );

    expect(res.status).toBe(401);
    expect(res.body).toEqual<GenericResponse>(ENSURE_LOGGED_IN_NO_TOKEN);
  });

  // TODO: don't know how to generate invalid token
  test("TODO: should fail when user has invalid authentication", async () => {
    //const res = await request(server.app).delete(
    //  `/${FAVORITE_CHARACTER_THREAD_ID}/hide`
    //);

    //expect(res.status).toBe(401);
    //expect(res.body).toEqual<GenericResponse>(ENSURE_LOGGED_IN_NO_TOKEN);
  });

  // TODO: permissions don't exist yet
  test("TODO: should fail when user is not authorized to access thread", async () => {
    //const res = await request(server.app).delete(
    //  `/${FAVORITE_CHARACTER_THREAD_ID}/hide`
    //);

    //expect(res.status).toBe(403);
    //expect(res.body).toEqual<GenericResponse>(ENSURE_THREAD_ACCESS_UNAUTHORIZED);
  });

  test("should fail when thread does not exist", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).delete(
      `/${NULL_ID}/hide`
    );

    expect(res.status).toBe(404);
    expect(res.body).toEqual<GenericResponse>(NULL_THREAD_NOT_FOUND);
  });
});
