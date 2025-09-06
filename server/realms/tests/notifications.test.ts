import { BOBATAN_USER_ID, SEXY_DADDY_USER_ID } from "test/data/auth.js";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils.js";

import { BOBATAN_NOTIFICATIONS } from "test/data/notifications.js";
import { TWISTED_MINDS_REALM_EXTERNAL_ID } from "test/data/realms.js";
import debug from "debug";
import request from "supertest";
import router from "../routes.js";

const log = debug("bobaserver:board:routes");
jest.mock("server/cache");
jest.mock("handlers/auth");
jest.mock("server/db-pool");

describe("Tests notifications REST API", () => {
  const server = startTestServer(router);

  test("should not return notifications data (logged out)", async () => {
    const res = await request(server.app).get(
      `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/notifications`
    );

    expect(res.status).toBe(401);
  });

  test("should return notifications data (logged in)", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(
      `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/notifications`
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual(BOBATAN_NOTIFICATIONS);
    log(res.body);
  });

  // TODO: check if any test user has outdated notifications or none, and test there

  test("should dismiss notifications", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app).delete(
        `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/notifications`
      );

      expect(res.status).toBe(204);
    });
  });
});
