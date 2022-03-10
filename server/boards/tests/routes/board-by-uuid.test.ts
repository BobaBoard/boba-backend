import { CacheKeys, cache } from "server/cache";
import { GORE_BOARD_ID, GORE_BOARD_METADATA } from "test/data/boards";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { BOBATAN_USER_ID } from "test/data/auth";
import { BoardMetadata } from "types/rest/boards";
import debug from "debug";
import { mocked } from "jest-mock";
import request from "supertest";
import router from "../../routes";
import stringify from "fast-json-stable-stringify";

const log = debug("bobaserver:board:routes");
jest.mock("server/cache");
jest.mock("handlers/auth");

describe("Tests boards REST API", () => {
  const server = startTestServer(router);

  test("should return board data (logged out)", async () => {
    const res = await request(server.app).get(`/${GORE_BOARD_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(GORE_BOARD_METADATA.LOGGED_OUT);
  });

  test("should return board data (logged in)", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(`/${GORE_BOARD_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(GORE_BOARD_METADATA.BOBATAN);
  }, 10000);

  test("should cache board data (logged out)", async () => {
    await request(server.app).get(`/${GORE_BOARD_ID}`);

    expect(cache().hset).toBeCalledWith(
      CacheKeys.BOARD_METADATA,
      GORE_BOARD_ID,
      stringify(GORE_BOARD_METADATA.LOGGED_OUT)
    );
  });

  test("should use cached board data (logged out)", async () => {
    const modifiedData: BoardMetadata = {
      ...GORE_BOARD_METADATA.LOGGED_OUT,
      tagline:
        "this is a modified board data to ensure we're returning the cached one",
    };
    mocked(cache().hget).mockResolvedValueOnce(stringify(modifiedData));
    const res = await request(server.app).get(`/${GORE_BOARD_ID}`);

    expect(cache().hget).toBeCalledTimes(1);
    expect(cache().hget).toBeCalledWith(
      CacheKeys.BOARD_METADATA,
      GORE_BOARD_ID
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual(modifiedData);
  });
});
