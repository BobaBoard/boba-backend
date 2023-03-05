import { BOBATAN_PINNED_BOARDS, JERSEY_DEVIL_BOBADEX } from "test/data/user";
import { BOBATAN_USER_ID, JERSEY_DEVIL_USER_ID } from "test/data/auth";
import { CacheKeys, cache } from "../../../cache";
import {
  TWISTED_MINDS_REALM_EXTERNAL_ID,
  UWU_REALM_EXTERNAL_ID,
} from "test/data/realms";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { mocked } from "jest-mock";
import request from "supertest";
import router from "../../routes";
import stringify from "fast-json-stable-stringify";

jest.mock("server/cache");
jest.mock("handlers/auth");

describe("Tests GET routes of users REST API", () => {
  const server = startTestServer(router);

  test("Prevents unauthorized access if no user logged in", async () => {
    const res = await request(server.app).get(`/@me`);
    expect(res.status).toBe(401);
  });

  test("returns data logged in user (cached)", async function () {
    const cachedData = {
      avatar_url: "/this_was_cached.png",
      username: "super_cached",
    };
    mocked(cache().hGet).mockResolvedValueOnce(stringify(cachedData));
    setLoggedInUser(JERSEY_DEVIL_USER_ID);

    const res = await request(server.app).get(`/@me`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(cachedData);
    expect(cache().hGet).toBeCalledTimes(1);
    expect(cache().hGet).toBeCalledWith(CacheKeys.USER, JERSEY_DEVIL_USER_ID);
  });

  test("caches logged in user data", async function () {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);

    const res = await request(server.app).get(`/@me`);
    expect(res.status).toBe(200);
    expect(cache().hSet).toBeCalledTimes(1);
    expect(cache().hSet).toBeCalledWith(
      CacheKeys.USER,
      JERSEY_DEVIL_USER_ID,
      // TODO: this will fail if we change what we cache. We should not
      // rely on the whole response being cached, but declare the object ourselves.
      stringify(res.body)
    );
  });

  test("Returns data for the logged in user", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).get(`/@me`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      avatar_url: "/hannibal.png",
      username: "jersey_devil_69",
    });
  });

  test("should return pinned boards for current realm", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(
      `/@me/pins/realms/${TWISTED_MINDS_REALM_EXTERNAL_ID}`
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual(BOBATAN_PINNED_BOARDS);
  });

  test("should only return pinned boards for current realm", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(
      `/@me/pins/realms/${UWU_REALM_EXTERNAL_ID}`
    );

    expect(res.status).toBe(200);
    expect(res.body.pinned_boards).toEqual({});
  });

  test.todo(
    "correctly updates the cache after user pins board (check users/@me/pins/realms/:realm_id endpoint; see pin-board.test.ts for context"
  );

  test("prevents unauthorized access to the @me Bobadex endpoint", async () => {
    const res = await request(server.app).get(`/@me/bobadex`);
    expect(res.status).toBe(401);
  });

  test("returns the logged in user's Bobadex data", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).get(`/@me/bobadex`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(JERSEY_DEVIL_BOBADEX);
  });
});
