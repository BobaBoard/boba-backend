import {
  TWISTED_MINDS_REALM_EXTERNAL_ID,
  UWU_REALM_EXTERNAL_ID,
} from "test/data/realms.js";
import { setLoggedInUser, startTestServer } from "utils/test-utils.js";

import { BOBATAN_PINNED_BOARDS } from "test/data/user.js";
import { BOBATAN_USER_ID } from "test/data/auth.js";
import request from "supertest";
import router from "../../routes.js";

vi.mock("server/cache.js");
vi.mock("handlers/auth.js");

describe("Tests users/@me/pins/realms/:realmId endpoint", () => {
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

  test.todo(
    "correctly updates the cache after user pins board (check users/@me/pins/realms/:realm_id endpoint; see pin-board.test.ts for context"
  );
});
