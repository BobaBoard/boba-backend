import { BOBATAN_PINNED_BOARDS, BOBATAN_USER_DATA } from "test/data/user";
import {
  TWISTED_MINDS_REALM_EXTERNAL_ID,
  UWU_REALM_EXTERNAL_ID,
} from "test/data/realms";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { BOBATAN_USER_ID } from "test/data/auth";
import debug from "debug";
import request from "supertest";
import router from "../../routes";

const log = debug("bobaserver:board:routes");
jest.mock("server/cache");
jest.mock("handlers/auth");

// NOTE: I am in the process of cleaning; I removed tests from this file that were already represented in the routes.test.ts file in the next directory up; consider whether to move the other tests there as well, or whether to move some here, or generally just how to organize
describe("Tests users REST API", () => {
  const server = startTestServer(router);

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
  
  // TODO: check if any test user has outdated notifications or none, and test there
});

// TODO: test dismiss notifications
