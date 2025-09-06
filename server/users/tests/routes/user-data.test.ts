import * as userQueries from "../../queries.js";

import { CacheKeys, cache } from "../../../cache.js";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils.js";

import { JERSEY_DEVIL_USER_ID } from "test/data/auth.js";

import request from "supertest";
import router from "../../routes.js";
import stringify from "fast-json-stable-stringify";

vi.mock("server/db-pool.js");
vi.mock("server/cache.js");
vi.mock("handlers/auth.js");

describe("Tests users/@me endpoint", () => {
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
    vi.mocked(cache().hGet).mockResolvedValueOnce(stringify(cachedData));
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

  const testUserPatch = {
    username: "SnazzyNewName",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fusers%2Favatar%2F4f5fde75-e670-4bb2-a04f-e90a5038ee34.jpeg?alt=media&token=7bdc5534-3159-4856-8d98-937cc1ee642f",
  };

  test("prevents unauthorized PATCH access to the @me endpoint", async () => {
    await wrapWithTransaction(async () => {
      const res = await request(server.app).patch(`/@me`).send(testUserPatch);

      expect(res.status).toBe(401);
    });
  });

  test("should update the logged-in user's information, and update the cache", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(JERSEY_DEVIL_USER_ID);

      const res = await request(server.app).patch(`/@me`).send(testUserPatch);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        username: testUserPatch.username,
        avatar_url: testUserPatch.avatarUrl,
      });
      expect(cache().hDel).toBeCalledTimes(1);
      expect(cache().hDel).toBeCalledWith(CacheKeys.USER, JERSEY_DEVIL_USER_ID);
    });
  });

  test("returns a bad request error if username or avatar URL is missing", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(JERSEY_DEVIL_USER_ID);
      const res = await request(server.app)
        .patch(`/@me`)
        .send({ username: "Newname" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Missing username or avatar url" });
    });
  });

  test("returns a 500 error if the database response is falsy", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(JERSEY_DEVIL_USER_ID);
      vi.spyOn(userQueries, "updateUserData").mockResolvedValueOnce(null);
      const res = await request(server.app).patch(`/@me`).send(testUserPatch);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({});
    });
  });
});
