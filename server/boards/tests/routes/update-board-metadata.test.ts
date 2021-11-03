import { BOBATAN_USER_ID, JERSEY_DEVIL_USER_ID } from "test/data/auth";
import { CacheKeys, cache } from "server/cache";
import { GORE_BOARD_ID, GORE_BOARD_METADATA } from "test/data/boards";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

import request from "supertest";
import router from "../../routes";

jest.mock("server/cache");
jest.mock("handlers/auth");
jest.mock("server/db-pool");

describe("Tests boards REST API", () => {
  const server = startTestServer(router);

  test("Should return 401 if user is not logged in", async () => {
    const res = await request(server.app).patch(`/${GORE_BOARD_ID}`);

    expect(res.status).toBe(401);
  });

  test("Should return 404 if board does not exist", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).patch("/this_board_does_not_exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      message: `The board with id "this_board_does_not_exist" was not found.`,
    });
  });

  test("Should return 403 if user does not have required permissions", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).patch(`/${GORE_BOARD_ID}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      message: `User cannot access board with id "c6d3d10e-8e49-4d73-b28a-9d652b41beec".`,
    });
  });

  test("Should update board metadata", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app).patch(`/${GORE_BOARD_ID}`).send({
        descriptions: [],
        accentColor: "red",
        tagline: "a new tagline",
      });

      // Ensure that the board metadata was removed from the cache.
      expect(cache().hdel).toBeCalledTimes(2);
      expect(cache().hdel).toBeCalledWith(
        CacheKeys.BOARD_METADATA,
        GORE_BOARD_ID
      );
      expect(cache().hdel).toBeCalledWith(CacheKeys.BOARD, GORE_BOARD_ID);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...GORE_BOARD_METADATA.BOBATAN,
        accent_color: "red",
        tagline: "a new tagline",
        descriptions: [],
      });
    });
  });

  test("Should correctly handle cache", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app).patch(`/${GORE_BOARD_ID}`).send({
        descriptions: [],
        accentColor: "red",
        tagline: "a new tagline",
      });

      // NOTE: We only save the metadata when the user is not logged in,
      // so we don't do it in this method.
      // Ensure that the board metadata was removed from the cache.
      expect(cache().hdel).toBeCalledTimes(2);
      expect(cache().hdel).toBeCalledWith(CacheKeys.BOARD, GORE_BOARD_ID);
      expect(cache().hdel).toBeCalledWith(
        CacheKeys.BOARD_METADATA,
        GORE_BOARD_ID
      );
    });
  });
});
