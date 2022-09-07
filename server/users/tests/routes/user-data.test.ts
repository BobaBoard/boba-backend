import { BOBATAN_PINNED_BOARDS, BOBATAN_USER_DATA } from "test/data/user";
import {
  TWISTED_MINDS_REALM_STRING_ID,
  UWU_REALM_STRING_ID,
} from "test/data/realms";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { BOBATAN_USER_ID } from "test/data/auth";
import debug from "debug";
import request from "supertest";
import router from "../../routes";

const log = debug("bobaserver:board:routes");
jest.mock("server/cache");
jest.mock("handlers/auth");

describe("Tests boards REST API", () => {
  const server = startTestServer(router);

  test("should not return user data (logged out)", async () => {
    const res = await request(server.app).get(`/@me`);

    expect(res.status).toBe(401);
  });

  test("should return user data (logged in)", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(`/@me`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(BOBATAN_USER_DATA);
  });

  test("should return pinned boards for current realm", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(
      `/@me/pins/realms/${TWISTED_MINDS_REALM_STRING_ID}`
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual(BOBATAN_PINNED_BOARDS);
  });

  test("should only return pinned boards for current realm", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(
      `/@me/pins/realms/${UWU_REALM_STRING_ID}`
    );

    expect(res.status).toBe(200);
    expect(res.body.pinned_boards).toEqual({});
  });

  // TODO: check if any test user has outdated notifications or none, and test there
});

// TODO: test dismiss notifications
