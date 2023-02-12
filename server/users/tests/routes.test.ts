import { CacheKeys, cache } from "../../cache";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { JERSEY_DEVIL_USER_ID } from "test/data/auth";
import { TWISTED_MINDS_REALM_EXTERNAL_ID } from "test/data/realms";
import debug from "debug";
import { ensureLoggedIn } from "handlers/auth";
import { getUserFromFirebaseId } from "../queries";
import { mocked } from "ts-jest/utils";
import request from "supertest";
import router from "../routes";
import stringify from "fast-json-stable-stringify";

jest.mock("../../cache");
jest.mock("handlers/auth");
const log = debug("bobaserver:test:users:routes-log");

describe("Test users routes", () => {
  const server = startTestServer(router);

  test("gets user from id", async () => {
    const user = await getUserFromFirebaseId({
      firebaseId: JERSEY_DEVIL_USER_ID,
    });

    expect(user).toEqual({
      avatar_reference_id: "hannibal.png",
      created_on: null,
      firebase_id: JERSEY_DEVIL_USER_ID,
      id: "2",
      invited_by: "1",
      username: "jersey_devil_69",
    });
  });

  test("returns data logged in user (cached)", async function () {
    const cachedData = {
      avatar_url: "/this_was_cached.png",
      username: "super_cached",
    };
    mocked(cache().hGet).mockResolvedValueOnce(stringify(cachedData));
    setLoggedInUser(JERSEY_DEVIL_USER_ID);

    const res = await request(server.app).get(`/@me`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(cachedData);
    expect(cache().hGet).toBeCalledTimes(1);
    expect(cache().hGet).toBeCalledWith(CacheKeys.USER, JERSEY_DEVIL_USER_ID);
  });

  test("Prevents unauthorized access", async () => {
    const res = await request(server.app).get(`/@me`);
    expect(res.status).toBe(401);
  });

  test("Returns data for the logged in user", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).get(`/@me`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      avatar_url: "/hannibal.png",
      username: "jersey_devil_69",
    });
  });

  test("caches logged in user data", async function () {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);

    const res = await request(server.app).get(`/@me`);
    expect(res.status).toBe(200);
    expect(cache().hSet).toBeCalledTimes(1);
    expect(cache().hSet).toBeCalledWith(
      CacheKeys.USER,
      JERSEY_DEVIL_USER_ID,
      // TODO: this will fail if we change what we cache. We should not
      // rely on the whole response being cached, but declare the object ourselves.
      stringify(res.body)
    );
  });

  test("Correctly updates the cache after user pins board", async function () { });

  test("returns the logged in user's Bobadex data", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).get(`/@me/bobadex`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      seasons: [
        {
          id: '9f6d41a5-1e00-4071-9f50-555f1686f87f',
          name: 'Default',
          realm_id: 'v0',
          identities_count: '3',
          caught_identities: [
            {
              id: '85e33a3c-f987-41fd-a555-4c0cfdedf737',
              name: 'Old Time-y Anon',
              index: 1,
              avatar: 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2F5c2c3867-2323-4209-8bd4-9dfcc88808f3%2Fd931f284-5c22-422d-9343-e509cfb44ffc.png?alt=media&token=94e52fff-4e6b-4110-94c3-90b8800f541c'
            },
            {
              id: '07f4cbbb-6a62-469e-8789-1b673a6d622f',
              name: 'DragonFucker',
              index: 2,
              avatar: 'https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg'
            }
          ]
        },
        {
          id: '9b496931-ba27-43e0-953b-c38e01803879',
          name: 'Halloween',
          realm_id: 'v0',
          identities_count: '3',
          caught_identities: [
            {
              id: '47bf62fa-755f-489f-9735-27c884a0dec3',
              name: 'The OG OG Komaeda',
              index: 3,
              avatar: 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F1237fd9e-cd40-41b8-8ee7-11c865f27b6b?alt=media&token=4bb418a6-cb45-435c-85ed-7bdcb294f5b5'
            }
          ]
        },
        {
          id: 'be93274d-cdb9-4fcc-a4f9-a9c69270ce0d',
          name: 'Coders',
          realm_id: 'v0',
          identities_count: '5',
          caught_identities: []
        }
      ]
    });
  });
});
