import { setLoggedInUser, startTestServer } from "utils/test-utils";

import request from "supertest";
import router from "../../routes";

jest.mock("handlers/auth");

describe("Test feed of restricted boards REST API", () => {
  const server = startTestServer(router);

  test("doesn't fetch board activity when logged out (REST)", async () => {
    const res = await request(server.app).get("/boards/restricted");

    expect(res.status).toBe(403);
    expect(res.body).toEqual({});
  });

  test("fetches restricted board activity when logged in (REST)", async () => {
    setLoggedInUser("c6HimTlg2RhVH3fC1psXZORdLcx2");
    const res = await request(server.app).get("/boards/restricted");

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });
});
