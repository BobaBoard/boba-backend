import * as userQueries from "../../queries";

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

describe("Tests users/@me/settings endpoint", () => {
  const server = startTestServer(router);

  test("prevents unauthorized access to the @me settings endpoint", async () => {
    const res = await request(server.app).get(`/@me/settings`);
    expect(res.status).toBe(401);
  });

  test("returns the logged in user's settings", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).get(`/@me/settings`);

    const expectedResponse = { decorations: [] };

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expectedResponse);
  });

  const testSettingsPatch = {
    name: "FESTIVE_BACKGROUND_HEADER",
    value: false,
  };

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

  test("returns an error if something went wrong while updating settings", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(JERSEY_DEVIL_USER_ID);
      const testError = new Error("update failed");
      jest
        .spyOn(userQueries, "updateUserSettings")
        .mockRejectedValueOnce(testError);

      const res = await request(server.app)
        .patch(`/@me/settings`)
        .send(testSettingsPatch);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        message: `Failed to update user settings. Reason: ${testError}`,
      });
    });
  });
});
