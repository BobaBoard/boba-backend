import {
  ENSURE_LOGGED_IN_INVALID_TOKEN,
  ENSURE_LOGGED_IN_NO_TOKEN,
  ENSURE_THREAD_ACCESS_UNAUTHORIZED,
} from "test/data/responses.js";
import { NULL_ID, NULL_THREAD_NOT_FOUND } from "test/data/threads.js";
import { setLoggedInUser, startTestServer } from "utils/test-utils.js";

import type { GenericResponse } from "types/rest/responses.js";
import request from "supertest";
import router from "../../routes.js";
import { wrapWithTransaction } from "utils/test-utils.js";

jest.mock("handlers/auth.js");
jest.mock("server/db-pool.js");

const CHARACTER_TO_MAIM_THREAD_ID = "29d1b2da-3289-454a-9089-2ed47db4967b";

describe("Tests update view REST API", () => {
  const server = startTestServer(router);

  test("should fail when user is unauthenticated", async () => {
    await wrapWithTransaction(async () => {
      const res = await request(server.app)
        .patch(`/${CHARACTER_TO_MAIM_THREAD_ID}`)
        .send({
          defaultView: "gallery",
        });
      expect(res.status).toBe(401);
      expect(res.body).toEqual<GenericResponse>(ENSURE_LOGGED_IN_NO_TOKEN);
    });
  });

  // TODO: don't know how to generate invalid token
  test("TODO: should fail when user has invalid authentication", async () => {
    //await wrapWithTransaction(async () => {
    //  const res = await request(server.app)
    //    .patch(`/${CHARACTER_TO_MAIM_THREAD_ID}`)
    //    .send({
    //      defaultView: "gallery",
    //    });
    //expect(res.status).toBe(401);
    //expect(res.body).toEqual<GenericResponse>(ENSURE_LOGGED_IN_NO_TOKEN);
    //});
  });

  test("should prevent operation if permissions missing", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser("fb2");
      const res = await request(server.app)
        .patch(`/${CHARACTER_TO_MAIM_THREAD_ID}`)
        .send({
          defaultView: "gallery",
        });
      expect(res.status).toBe(403);
    });
  });

  // TODO: ensureThreadPermissions does not check if board exists
  test("TODO: should fail if thread does not exist", async () => {
    //await wrapWithTransaction(async () => {
    //  setLoggedInUser("fb2");
    //  const res = await request(server.app)
    //    .patch(`/${NULL_ID}`)
    //    .send({
    //      defaultView: "gallery",
    //    });
    //  expect(res.status).toBe(404);
    //  expect(res.body).toEqual<GenericResponse>(NULL_THREAD_NOT_FOUND);
    //});
  });

  test("TODO: should fail request body is invalid", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser("fb3");
      const res = await request(server.app)
        .patch(`/${CHARACTER_TO_MAIM_THREAD_ID}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  test("should update view data", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser("fb3");
      const res = await request(server.app)
        .patch(`/${CHARACTER_TO_MAIM_THREAD_ID}`)
        .send({
          defaultView: "gallery",
        });
      expect(res.status).toBe(204);
      const threadRes = await request(server.app).get(
        `/${CHARACTER_TO_MAIM_THREAD_ID}`
      );
      expect(threadRes.status).toBe(200);
      expect(threadRes.body.default_view).toEqual("gallery");
    });
  }, 10000);
});
