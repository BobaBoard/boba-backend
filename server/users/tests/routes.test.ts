import * as userQueries from "../queries";

import { CacheKeys, cache } from "../../cache";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

import { JERSEY_DEVIL_USER_ID } from "test/data/auth";
import { mocked } from "jest-mock";
import request from "supertest";
import router from "../routes";
import stringify from "fast-json-stable-stringify";

jest.mock("../../cache");
jest.mock("handlers/auth");
jest.mock("server/db-pool");

describe("Tests basic routes of users REST API", () => {
  const server = startTestServer(router);

  describe("Cache tests", () => {
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

    test.todo("Correctly updates the cache after user pins board");
  });

  describe("GET tests", () => {
    test("Prevents unauthorized access if no user logged in", async () => {
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
  });

  describe("PATCH tests", () => {
    const testPatch = {
      username: "SnazzyNewName",
      avatarUrl:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fusers%2Favatar%2F4f5fde75-e670-4bb2-a04f-e90a5038ee34.jpeg?alt=media&token=7bdc5534-3159-4856-8d98-937cc1ee642f",
    };

    test("prevents unauthorized PATCH access to the @me endpoint", async () => {
      await wrapWithTransaction(async () => {
        const res = await request(server.app).patch(`/@me`).send(testPatch);

        expect(res.status).toBe(401);
      });
    });

    test("should update the logged-in user's information", async () => {
      await wrapWithTransaction(async () => {
        setLoggedInUser(JERSEY_DEVIL_USER_ID);

        const res = await request(server.app).patch(`/@me`).send(testPatch);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          username: testPatch.username,
          avatar_url: testPatch.avatarUrl,
        });
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
        jest.spyOn(userQueries, "updateUserData").mockResolvedValueOnce(null);
        const res = await request(server.app).patch(`/@me`).send(testPatch);

        expect(res.status).toBe(500);
        expect(res.body).toEqual({});
      });
    });
  });
});
