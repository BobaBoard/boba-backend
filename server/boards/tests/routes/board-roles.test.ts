import {
  BOBATAN_USER_ID,
  JERSEY_DEVIL_USER_ID,
} from "test/data/auth";

import {
    GORE_BOARD_ID,
  } from "test/data/boards";


import { setLoggedInUser, startTestServer } from "utils/test-utils";
import debug from "debug";
import { mocked } from "ts-jest/utils";
import request from "supertest";
import router from "../../routes";
import stringify from "fast-json-stable-stringify";

const log = debug("bobaserver:board:routes");
jest.mock("handlers/auth");


describe("Tests board role queries", () => {
  const server = startTestServer(router);

  test("fetches board roles with permissions", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(`/${GORE_BOARD_ID}/roles`);
    console.log(res.body)
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
        roles: [
          {
            user_firebase_id: 'c6HimTlg2RhVH3fC1psXZORdLcx2',
            username: 'bobatan',
            role_string_id: "e5f86f53-6dcd-4f15-b6ea-6ca1f088e62d",
            role_name: 'GoreMaster5000',
            label: 'Test Label'
          }
        ]
      });
  });

  test("does not fetch board roles without permissions", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).get(`/${GORE_BOARD_ID}/roles`);
    console.log(res.body)
    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      message: 'User does not have required permissions for board operation.'
    });
  });
});
