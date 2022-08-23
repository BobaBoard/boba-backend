import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { BOBATAN_USER_DATA } from "test/data/user";
import { BOBATAN_USER_ID } from "test/data/auth";
import { TWISTED_MINDS_REALM_STRING_ID } from "test/data/realms";
import debug from "debug";
import request from "supertest";
import router from "../../routes";

const log = debug("bobaserver:board:routes");
jest.mock("server/cache");
jest.mock("handlers/auth");

describe("Tests boards REST API", () => {
  const server = startTestServer(router);

  test("should not return notifications data (logged out)", async () => {
    const res = await request(server.app).get(`/@me/${TWISTED_MINDS_REALM_STRING_ID}`);

    expect(res.status).toBe(401);
  });

  test("should return notifications data (logged in)", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(`/@me/${TWISTED_MINDS_REALM_STRING_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(BOBATAN_USER_DATA);
  });

  // TODO: check if any test user has outdated notifications or none, and test there
});

// TODO: test dismiss notifications
