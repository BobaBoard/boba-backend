import { BOBATAN_USER_ID, JERSEY_DEVIL_USER_ID } from "test/data/auth";
import { CacheKeys, cache } from "server/cache";
import {
  GORE_BOARD_ID,
  GORE_BOARD_METADATA,
  MAIN_STREET_BOARD_ID,
  RESTRICTED_BOARD_ID,
} from "test/data/boards";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

import { TWISTED_MINDS_REALM_EXTERNAL_ID } from "test/data/realms";
import request from "supertest";
import router from "../../routes";

jest.mock("server/cache");
jest.mock("handlers/auth");
jest.mock("server/db-pool");

describe("Tests pin boards REST API", () => {
  const server = startTestServer(router);

  test("Should return 401 if user is not logged in", async () => {
    const res = await request(server.app).post(`/${GORE_BOARD_ID}/pin`);

    expect(res.status).toBe(401);
  });

  test("Should return 404 if board does not exist", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).post(
      "/this_board_does_not_exist/pin"
    );

    expect(res.status).toBe(404);
  });

  test("Should return 403 if user does not have required permissions", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).post(`/${RESTRICTED_BOARD_ID}/pin`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      message: "User does not have required permission to access board.",
    });
  });

  test("Should pin board", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .post(`/${MAIN_STREET_BOARD_ID}/pin`)
        .send();

      // Ensure that the user cache was cleared since that contains the pinned boards.
      // TODO: this is an implementation details and it should be tested by checking the
      // users/@me/pins/realm/:realm_id endpoint.
      expect(cache().hdel).toBeCalledTimes(2);
      expect(cache().hdel).toBeCalledWith(CacheKeys.USER_PINS, BOBATAN_USER_ID);
      expect(cache().hdel).toBeCalledWith(
        CacheKeys.BOARD,
        MAIN_STREET_BOARD_ID
      );
      expect(res.status).toBe(204);

      const pinnedRes = await request(server.app).get(
        `/${MAIN_STREET_BOARD_ID}`
      );
      expect(pinnedRes.status).toBe(200);
      expect(pinnedRes.body.pinned).toEqual(true);
    });
  }, 10000);
});

describe("Tests unpin boards REST API", () => {
  const server = startTestServer(router);

  test("Should return 401 if user is not logged in", async () => {
    const res = await request(server.app).delete(`/${GORE_BOARD_ID}/pin`);

    expect(res.status).toBe(401);
  });

  test("Should return 404 if board does not exist", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).delete(
      "/this_board_does_not_exist/pin"
    );

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      message: `The board with id "this_board_does_not_exist" was not found.`,
    });
  });

  test("Should return 403 if user does not have required permissions", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).delete(`/${RESTRICTED_BOARD_ID}/pin`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      message: "User does not have required permission to access board.",
    });
  });

  test("Should unpin board", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .delete(`/${GORE_BOARD_ID}/pin`)
        .send();

      // Ensure that the user cache was cleared since that contains the pinned boards.
      // TODO: this is an implementation details and it should be tested by checking the
      // users/@me/pins/realm/:realm_id endpoint.
      expect(cache().hdel).toBeCalledTimes(2);
      expect(cache().hdel).toBeCalledWith(CacheKeys.USER_PINS, BOBATAN_USER_ID);
      expect(cache().hdel).toBeCalledWith(CacheKeys.BOARD, GORE_BOARD_ID);
      expect(res.status).toBe(204);

      const boardMetadata = await request(server.app).get(`/${GORE_BOARD_ID}`);
      expect(boardMetadata.status).toBe(200);
      expect(boardMetadata.body.pinned).toEqual(false);
    });
  }, 10000);
});
