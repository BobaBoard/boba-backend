import { BOBATAN_USER_ID, JERSEY_DEVIL_USER_ID } from "test/data/auth.js";
import { CacheKeys, cache } from "server/cache.js";
import {
  GORE_BOARD_ID,
  MAIN_STREET_BOARD_ID,
  MUTED_BOARD_ID,
  RESTRICTED_BOARD_ID,
} from "test/data/boards.js";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils.js";

import request from "supertest";
import router from "../../routes.js";

vi.mock("server/cache.js");
vi.mock("handlers/auth.js");
vi.mock("server/db-pool.js");

describe("Tests mute boards REST API", () => {
  const server = startTestServer(router);

  test("Should return 401 if user is not logged in", async () => {
    const res = await request(server.app).post(`/${GORE_BOARD_ID}/mute`);

    expect(res.status).toBe(401);
  });

  test("Should return 404 if board does not exist", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).post(
      "/this_board_does_not_exist/mute"
    );

    expect(res.status).toBe(404);
  });

  //   test("Should return 403 if user does not have required permissions", async () => {
  //     setLoggedInUser(JERSEY_DEVIL_USER_ID);
  //     const res = await request(server.app).post(`/${RESTRICTED_BOARD_ID}/mute`);

  //     expect(res.status).toBe(403);
  //     expect(res.body).toEqual({
  //       message: `User cannot access board with id "c6d3d10e-8e49-4d73-b28a-9d652b41beec".`,
  //     });
  //   });

  test("Should mute board", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .post(`/${MAIN_STREET_BOARD_ID}/mute`)
        .send();

      expect(res.status).toBe(204);
      // Ensure that the user cache was cleared since that contains the muted boards.
      // TODO: this is an implementation details and it should be tested by checking the
      // users/@me/pins/realm/:realm_id endpoint.
      expect(cache().hDel).toBeCalledTimes(2);
      expect(cache().hDel).toBeCalledWith(CacheKeys.USER_PINS, BOBATAN_USER_ID);
      expect(cache().hDel).toBeCalledWith(
        CacheKeys.BOARD,
        MAIN_STREET_BOARD_ID
      );

      const mutedRes = await request(server.app).get(
        `/${MAIN_STREET_BOARD_ID}`
      );
      expect(mutedRes.status).toBe(200);
      expect(mutedRes.body.muted).toEqual(true);
    });
  }, 10000);
});

describe("Tests unmute boards REST API", () => {
  const server = startTestServer(router);

  test("Should return 401 if user is not logged in", async () => {
    const res = await request(server.app).delete(`/${GORE_BOARD_ID}/mute`);

    expect(res.status).toBe(401);
  });

  test("Should return 404 if board does not exist", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).delete(
      "/this_board_does_not_exist/mute"
    );

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      message: `The board with id "this_board_does_not_exist" was not found.`,
    });
  });

  //   test("Should return 403 if user does not have required permissions", async () => {
  //     setLoggedInUser(JERSEY_DEVIL_USER_ID);
  //     const res = await request(server.app).delete(
  //       `/${RESTRICTED_BOARD_ID}/mute`
  //     );

  //     expect(res.status).toBe(403);
  //     expect(res.body).toEqual({
  //       message: `User cannot access board with id "c6d3d10e-8e49-4d73-b28a-9d652b41beec".`,
  //     });
  //   });

  test("Should unmute board", async () => {
    await wrapWithTransaction(async () => {
      // TODO: this should check that the board is indeed muted before we begin.
      setLoggedInUser(JERSEY_DEVIL_USER_ID);
      const res = await request(server.app)
        .delete(`/${MUTED_BOARD_ID}/mute`)
        .send();

      expect(res.status).toBe(204);
      // Ensure that the user cache was cleared since that contains the muted boards.
      // TODO: this is an implementation details and it should be tested by checking the
      // users/@me/pins/realm/:realm_id endpoint.
      expect(cache().hDel).toBeCalledTimes(2);
      expect(cache().hDel).toBeCalledWith(
        CacheKeys.USER_PINS,
        JERSEY_DEVIL_USER_ID
      );
      expect(cache().hDel).toBeCalledWith(CacheKeys.BOARD, MUTED_BOARD_ID);

      const boardMetadata = await request(server.app).get(`/${MUTED_BOARD_ID}`);
      expect(boardMetadata.status).toBe(200);
      expect(boardMetadata.body.muted).toEqual(false);
    });
  }, 10000);
});
