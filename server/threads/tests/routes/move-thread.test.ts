jest.mock("handlers/auth.js");
jest.mock("server/db-pool.js");

import {
  ENSURE_LOGGED_IN_INVALID_TOKEN,
  ENSURE_LOGGED_IN_NO_TOKEN,
  ENSURE_THREAD_PERMISSIONS_UNAUTHORIZED,
} from "test/data/responses.js";
import { LONG_BOARD_ID, NULL_BOARD_NOT_FOUND } from "test/data/boards.js";
import { NULL_ID, NULL_THREAD_NOT_FOUND } from "test/data/threads.js";
import { setLoggedInUser, startTestServer } from "utils/test-utils.js";

import { BOBATAN_USER_ID } from "test/data/auth.js";
import type { GenericResponse } from "types/rest/responses.js";
import request from "supertest";
import router from "../../routes.js";
import { wrapWithTransaction } from "utils/test-utils.js";




const CHARACTER_TO_MAIM_THREAD_ID = "29d1b2da-3289-454a-9089-2ed47db4967b";

describe("Tests move thread REST API", () => {
  const server = startTestServer(router);

  test("should fail when user is unauthenticated", async () => {
    await wrapWithTransaction(async () => {
      const res = await request(server.app)
        .patch(`/${CHARACTER_TO_MAIM_THREAD_ID}`)
        .send({
          parentBoardId: LONG_BOARD_ID,
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
    //      parentBoardId: LONG_BOARD_ID,
    //    });
    //  expect(res.status).toBe(401);
    //  expect(res.body).toEqual<GenericResponse>(ENSURE_LOGGED_IN_INVALID_TOKEN);
    //});
  });

  test("should prevent move when user is not authorized for thread", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser("fb2");
      const res = await request(server.app)
        .patch(`/${CHARACTER_TO_MAIM_THREAD_ID}`)
        .send({
          parentBoardId: LONG_BOARD_ID,
        });
      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        message:
          "User does not have permission to move thread thread with id 29d1b2da-3289-454a-9089-2ed47db4967b.",
      });
    });
  });

  // TODO: permissions functionality not implemented
  test("TODO: should prevent move when user is not authorized for board", async () => {
    //await wrapWithTransaction(async () => {
    //  setLoggedInUser("fb2");
    //  const res = await request(server.app)
    //    .patch(`/${CHARACTER_TO_MAIM_THREAD_ID}`)
    //    .send({
    //      parentBoardId: LONG_BOARD_ID,
    //    });
    //expect(res.status).toBe(403);
    //expect(res.body).toEqual<GenericResponse>(ENSURE_BOARD_PERMISSIONS_UNAUTHORIZED);
    //});
  });

  // ensureThreadPermissions does not check whether board exists
  test("TODO: should fail when thread does not exist", async () => {
    //await wrapWithTransaction(async () => {
    //  setLoggedInUser(BOBATAN_USER_ID);
    //  const res = await request(server.app)
    //    .patch(`/${NULL_ID}`)
    //    .send({
    //      parentBoardId: LONG_BOARD_ID,
    //    });
    //  expect(res.status).toBe(404);
    //  expect(res.body).toEqual<GenericResponse>(NULL_THREAD_NOT_FOUND);
    //});
  });

  test("should fail when board does not exist", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .patch(`/${CHARACTER_TO_MAIM_THREAD_ID}`)
        .send({
          parentBoardId: NULL_ID,
        });
      expect(res.status).toBe(404);
      expect(res.body).toEqual<GenericResponse>(NULL_BOARD_NOT_FOUND);
    });
  });

  // No request body validation for /thread yet
  test("TODO: should fail if request body is invalid", async () => {
    //await wrapWithTransaction(async () => {
    //  setLoggedInUser(BOBATAN_USER_ID);
    //  const res = await request(server.app)
    //    .patch(`/${NULL_ID}`)
    //    .send({
    //      parentBoardId: LONG_BOARD_ID,
    //    });
    //  expect(res.status).toBe(422);
    //});
  });

  test("should move thread", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .patch(`/${CHARACTER_TO_MAIM_THREAD_ID}`)
        .send({
          parentBoardId: LONG_BOARD_ID,
        });
      expect(res.status).toBe(204);
      const threadRes = await request(server.app).get(
        `/${CHARACTER_TO_MAIM_THREAD_ID}`
      );
      expect(threadRes.status).toBe(200);
      expect(threadRes.body.parent_board_id).toEqual(LONG_BOARD_ID);
    });
  }, 10000);
});
