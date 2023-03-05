import { BOBATAN_USER_ID, JERSEY_DEVIL_USER_ID } from "test/data/auth";
import {
  TWISTED_MINDS_REALM_EXTERNAL_ID,
  UWU_REALM_EXTERNAL_ID,
} from "test/data/realms";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { BOBATAN_PINNED_BOARDS } from "test/data/user";
import request from "supertest";
import router from "../../routes";

jest.mock("server/cache");
jest.mock("handlers/auth");

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

  test("prevents unauthorized access to the @me Bobadex endpoint", async () => {
    const res = await request(server.app).get(`/@me/bobadex`);
    expect(res.status).toBe(401);
  });

  test("returns the logged in user's Bobadex data", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).get(`/@me/bobadex`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      seasons: [
        {
          id: "9f6d41a5-1e00-4071-9f50-555f1686f87f",
          name: "Default",
          // TODO: the realm_id should not be v0, it should be the external_id of the realm (a UUID) - fix this when the relevant changes have been made elsewhere in the project (which will ideally make this test fail)
          realm_id: "v0",
          // TODO: identities_count should be a number - fix this when changes have been made elsewhere (ideally making this test fail)
          identities_count: "3",
          caught_identities: [
            {
              id: "85e33a3c-f987-41fd-a555-4c0cfdedf737",
              name: "Old Time-y Anon",
              index: 1,
              avatar:
                "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2F5c2c3867-2323-4209-8bd4-9dfcc88808f3%2Fd931f284-5c22-422d-9343-e509cfb44ffc.png?alt=media&token=94e52fff-4e6b-4110-94c3-90b8800f541c",
            },
            {
              id: "07f4cbbb-6a62-469e-8789-1b673a6d622f",
              name: "DragonFucker",
              index: 2,
              avatar:
                "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
            },
          ],
        },
        {
          id: "9b496931-ba27-43e0-953b-c38e01803879",
          name: "Halloween",
          realm_id: "v0",
          identities_count: "3",
          caught_identities: [
            {
              id: "47bf62fa-755f-489f-9735-27c884a0dec3",
              name: "The OG OG Komaeda",
              index: 3,
              avatar:
                "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F1237fd9e-cd40-41b8-8ee7-11c865f27b6b?alt=media&token=4bb418a6-cb45-435c-85ed-7bdcb294f5b5",
            },
          ],
        },
        {
          id: "be93274d-cdb9-4fcc-a4f9-a9c69270ce0d",
          name: "Coders",
          realm_id: "v0",
          identities_count: "5",
          caught_identities: [],
        },
      ],
    });
  });

  // TODO: check if any test user has outdated notifications or none, and test there
});

// TODO: test dismiss notifications
