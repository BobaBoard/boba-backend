import * as userQueries from "../../queries";

import { CacheKeys, cache } from "../../../cache";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

import { JERSEY_DEVIL_USER_ID } from "test/data/auth";
import request from "supertest";
import router from "../../routes";

jest.mock("server/db-pool");
jest.mock("server/cache");
jest.mock("handlers/auth");

describe("Tests PATCH routes of users REST API", () => {
  const server = startTestServer(router);

  const testUserPatch = {
    username: "SnazzyNewName",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fusers%2Favatar%2F4f5fde75-e670-4bb2-a04f-e90a5038ee34.jpeg?alt=media&token=7bdc5534-3159-4856-8d98-937cc1ee642f",
  };

  const testSettingsPatch = {
    name: "FESTIVE_BACKGROUND_HEADER",
    value: false,
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
      jest.spyOn(userQueries, "updateUserData").mockResolvedValueOnce(null);
      const res = await request(server.app).patch(`/@me`).send(testUserPatch);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({});
    });
  });

  test("prevents unauthorized PATCH access to the @me settings endpoint", async () => {
    await wrapWithTransaction(async () => {
      const res = await request(server.app)
        .patch(`/@me/settings`)
        .send(testSettingsPatch);

      expect(res.status).toBe(401);
    });
  });

  test("updates user settings", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(JERSEY_DEVIL_USER_ID);
      const res = await request(server.app)
        .patch(`/@me/settings`)
        .send(testSettingsPatch);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        decorations: [
          {
            name: "FESTIVE_BACKGROUND_HEADER",
            type: "BOOLEAN",
            value: false,
          },
        ],
      });
    });
  });
});
