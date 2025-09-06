import { BOBATAN_USER_ID, JERSEY_DEVIL_USER_ID } from "test/data/auth.js";
import { CacheKeys, cache } from "../../../../server/cache.js";
import {
  GORE_BOARD_ID,
  GORE_BOARD_METADATA,
  RESTRICTED_BOARD_ID,
} from "test/data/boards.js";
import { setLoggedInUser, startTestServer } from "utils/test-utils.js";

import type { BoardMetadata } from "types/open-api/generated/types.js";
import debug from "debug";
import { mocked } from "jest-mock";
import request from "supertest";
import router from "../../routes.js";
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

    expect(cache().hSet).toBeCalledWith(
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
    mocked(cache().hGet).mockResolvedValueOnce(stringify(modifiedData));
    const res = await request(server.app).get(`/${GORE_BOARD_ID}`);

    expect(cache().hGet).toBeCalledTimes(1);
    expect(cache().hGet).toBeCalledWith(
      CacheKeys.BOARD_METADATA,
      GORE_BOARD_ID
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual(modifiedData);
  });

  test("Correctly does not return board data for restricted board if user not a realm member", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).get(`/${RESTRICTED_BOARD_ID}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      message: "User does not have required permission to access board.",
    });
  });

  test("Correctly does not return board data for restricted board if not logged in", async () => {
    const res = await request(server.app).get(`/${RESTRICTED_BOARD_ID}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      message: "User must be authenticated to access board.",
    });
  });
});
