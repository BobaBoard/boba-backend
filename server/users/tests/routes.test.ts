import { CacheKeys, cache } from "../../cache";
import { setLoggedInUser, startTestServer } from "../../../utils/test-utils";

import debug from "debug";
import { ensureLoggedIn } from "../../../handlers/auth";
import { getUserFromFirebaseId } from "../queries";
import { mocked } from "ts-jest/utils";
import request from "supertest";
import router from "../routes";

jest.mock("../../cache");
jest.mock("../../../handlers/auth");
const log = debug("bobaserver:test:users:routes-log");

describe("Test users routes", () => {
  const server = startTestServer(router);

  test("gets user from id", async () => {
    const user = await getUserFromFirebaseId({ firebaseId: "fb2" });

    expect(user).toEqual({
      avatar_reference_id: "hannibal.png",
      created_on: null,
      firebase_id: "fb2",
      id: "2",
      invited_by: "1",
      username: "jersey_devil_69",
    });
  });

  test("returns data logged in user (cached)", async function () {
    const cachedData = {
      avatar_url: "/this_was_cached.png",
      username: "super_cached",
      pinned_boards: {
        cached_board: {},
      },
    };

    setLoggedInUser("fb2");
    mocked(cache().hget).mockResolvedValueOnce(JSON.stringify(cachedData));

    const res = await request(server.app).get("/@me");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(cachedData);
    expect(cache().hget).toBeCalledTimes(1);
    expect(cache().hget).toBeCalledWith(CacheKeys.USER, "fb2");
  });

  test("Prevents unauthorized access", async () => {
    const res = await request(server.app).get("/@me");
    expect(res.status).toBe(401);
  });

  test("Returns data for the logged in user", async () => {
    setLoggedInUser("fb2");
    const res = await request(server.app).get("/@me");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      avatar_url: "/hannibal.png",
      username: "jersey_devil_69",
      pinned_boards: {},
    });

    mocked(ensureLoggedIn).mockRestore();
  });

  test("caches logged in user data", async function () {
    setLoggedInUser("fb2");

    const res = await request(server.app).get("/@me");
    expect(res.status).toBe(200);
    expect(cache().hset).toBeCalledTimes(1);
    expect(cache().hset).toBeCalledWith(
      CacheKeys.USER,
      "fb2",
      // TODO: this will fail if we change what we cache. We should not
      // rely on the whole response being cached, but declare the object ourselves.
      // ISSUE: JSON.stringify is not deterministic. Might use: https://www.npmjs.com/package/json-stable-stringify
      JSON.stringify(res.body)
    );
  });

  test("Correctly updates the cache after user pins board", async function () {});
});
