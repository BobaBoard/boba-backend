import { BOBATAN_USER_ID, JERSEY_DEVIL_USER_ID } from "test/data/auth";
import { GORE_BOARD_ID, GORE_BOARD_METADATA } from "test/data/boards";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import debug from "debug";
import request from "supertest";
import router from "../../routes";

const log = debug("bobaserver:board:routes");
jest.mock("../../../cache");
jest.mock("handlers/auth");

describe("Tests boards REST API", () => {
  const server = startTestServer(router);

  test("should return board data (logged out)", async () => {
    const res = await request(server.app).get(`/${GORE_BOARD_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(GORE_BOARD_METADATA.LOGGED_OUT);
  });

  test("should return board data (logged in)", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(`/${GORE_BOARD_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(GORE_BOARD_METADATA.BOBATAN);
  });
});
