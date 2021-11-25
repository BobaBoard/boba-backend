import {
  FAVORITE_CHARACTER_THREAD,
  FAVORITE_CHARACTER_THREAD_ID,
  RESTRICTED_THREAD,
  RESTRICTED_THREAD_ID,
  NULL_ID,
  NULL_THREAD_NOT_FOUND,
} from "test/data/threads";

import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { BOBATAN_USER_ID } from "test/data/auth";
import { Thread } from "types/rest/threads";
import { GenericResponse } from "types/rest/responses";
import request from "supertest";
import router from "../../routes";

jest.mock("handlers/auth");

describe("Tests threads REST API", () => {
  const server = startTestServer(router);

  test("should return threads data (logged out)", async () => {
    const res = await request(server.app).get(
      `/${FAVORITE_CHARACTER_THREAD_ID}`
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual<Thread>(FAVORITE_CHARACTER_THREAD);
  });

  test("should lock logged out access when board access restricted", async () => {
    const res = await request(server.app).get(`/${RESTRICTED_THREAD_ID}`);

    expect(res.status).toBe(401);
  });

  test("should allow logged in access when board access restricted", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(`/${RESTRICTED_THREAD_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual<Thread>(RESTRICTED_THREAD);
  });

  test("TODO: should lock when user does not have access to board", async () => {
    //setLoggedInUser(BOBATAN_USER_ID);
    //expect(res.status).toBe(403);
    //expect(res.body).toEqual<Thread>(RESTRICTED_THREAD);
  });

  test("should fail when thread does not exist", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(`/${NULL_ID}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual<GenericResponse>(NULL_THREAD_NOT_FOUND);
  });
});
