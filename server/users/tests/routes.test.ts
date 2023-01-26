import { CacheKeys, cache } from "../../cache";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { JERSEY_DEVIL_USER_ID } from "test/data/auth";
import { TWISTED_MINDS_REALM_EXTERNAL_ID } from "test/data/realms";
import debug from "debug";
import { ensureLoggedIn } from "handlers/auth";
import { getUserFromFirebaseId } from "../queries";
import { mocked } from "ts-jest/utils";
import request from "supertest";
import router from "../routes";
import stringify from "fast-json-stable-stringify";

jest.mock("../../cache");
jest.mock("handlers/auth");
const log = debug("bobaserver:test:users:routes-log");

describe("Test users routes", () => {
  const server = startTestServer(router);

  test("gets user from id", async () => {
    const user = await getUserFromFirebaseId({
      firebaseId: JERSEY_DEVIL_USER_ID,
    });

    expect(user).toEqual({
      avatar_reference_id: "hannibal.png",
      created_on: null,
      firebase_id: JERSEY_DEVIL_USER_ID,
      id: "2",
      invited_by: "1",
      username: "jersey_devil_69",
    });
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

  test("Prevents unauthorized access", async () => {
    const res = await request(server.app).get(`/@me`);
    expect(res.status).toBe(401);
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

  test("Correctly updates the cache after user pins board", async function () {});
});
