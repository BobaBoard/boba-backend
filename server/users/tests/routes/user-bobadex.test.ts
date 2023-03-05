import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { JERSEY_DEVIL_BOBADEX } from "test/data/user";
import { JERSEY_DEVIL_USER_ID } from "test/data/auth";
import request from "supertest";
import router from "../../routes";

jest.mock("server/cache");
jest.mock("handlers/auth");

describe("Tests users/@me/bobadex endpoint", () => {
  const server = startTestServer(router);

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
