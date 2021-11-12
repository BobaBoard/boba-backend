import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { BOBATAN_USER_ID } from "test/data/auth";
import { RESTRICTED_BOARD_ID } from "test/data/boards";
import { RESTRICTED_THREAD_SUMMARY } from "test/data/threads";
import request from "supertest";
import router from "../../routes";

jest.mock("handlers/auth");

describe("Test feed of restricted boards REST API", () => {
  const server = startTestServer(router);

  test("doesn't fetch board activity when logged out (REST)", async () => {
    const res = await request(server.app).get(`/boards/${RESTRICTED_BOARD_ID}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      message: "User does not have required permissions to access board.",
    });
  });

  test("fetches restricted board activity when logged in (REST)", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(`/boards/${RESTRICTED_BOARD_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      activity: [RESTRICTED_THREAD_SUMMARY],
      cursor: {
        next: null,
      },
    });
  });
});
