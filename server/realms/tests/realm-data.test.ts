import {
  BOBATAN_USER_ID,
  JERSEY_DEVIL_USER_ID,
  SEXY_DADDY_USER_ID,
} from "test/data/auth";
import { GORE_BOARD_METADATA, extractBoardSummary } from "test/data/boards";
import { TWISTED_MINDS_REALM_SLUG, UWU_REALM_SLUG } from "test/data/realms";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { BOBATAN_TWISTED_MINDS_REALM_PERMISSIONS } from "test/data/user";
import { REALM_MEMBER_PERMISSIONS } from "types/permissions";
import request from "supertest";
import router from "../routes";

jest.mock("handlers/auth");

describe("Tests restricted board realm queries", () => {
  const server = startTestServer(router);
  test("fetches board details when logged in (REST)", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get("/slug/twisted-minds");

    expect(res.status).toBe(200);
    expect(res.body.boards.length).toBe(8);
    expect(res.body.boards.find((board: any) => board.slug == "gore")).toEqual(
      extractBoardSummary(GORE_BOARD_METADATA.BOBATAN)
    );
  });

  test("doesn't fetch restricted board details in realm query when logged out", async () => {
    const res = await request(server.app).get("/slug/twisted-minds");

    expect(res.status).toBe(200);
    expect(res.body.boards.length).toBe(8);
    expect(res.body.boards.find((board: any) => board.slug == "gore")).toEqual(
      extractBoardSummary(GORE_BOARD_METADATA.LOGGED_OUT)
    );
  });

  test("returns empty block array in homepage", async () => {
    const res = await request(server.app).get("/slug/uwu");

    expect(res.status).toBe(200);
    expect(res.body.homepage).toEqual({
      blocks: [],
    });
  });

  test("returns rule blocks in homepage", async () => {
    const res = await request(server.app).get("/slug/twisted-minds");

    expect(res.status).toBe(200);
    expect(res.body.homepage).toEqual({
      blocks: [
        {
          id: "82824aa5-f0dc-46b7-ad7b-aefac7f637cc",
          index: 0,
          rules: [
            {
              description: "Anything above Assembly was a mistake.",
              index: 2,
              pinned: true,
              title: "No language discoursing",
            },
            {
              description:
                "They're young and scared, but are doing their best.",
              index: 0,
              pinned: true,
              title: "Be nice to baby coders",
            },
            {
              description:
                "If you feel the need to thirst for a fictional character, the fandom category is your friend.",
              index: 1,
              pinned: false,
              title: "No horny on main (boards)",
            },
          ],
          title: "The twisted rules",
          type: "rules",
        },
        {
          id: "61ab444a-7db3-42f9-86c3-0ac188199fc4",
          index: 1,
          subscription_id: "11e29fe7-1913-48a5-a3aa-9f01358d212f",
          title: "Twisted updates",
          type: "subscription",
        },
      ],
    });
  });

  test("fetches user realm permissions when user has realm permissions", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(
      `/slug/${TWISTED_MINDS_REALM_SLUG}`
    );

    expect(res.status).toBe(200);
    expect(res.body.realm_permissions.length).toBe(
      BOBATAN_TWISTED_MINDS_REALM_PERMISSIONS.length
    );
    expect(res.body.realm_permissions).toEqual(
      BOBATAN_TWISTED_MINDS_REALM_PERMISSIONS
    );
  });

  test("fetches user realm permissions when user is realm member without other roles on realm", async () => {
    setLoggedInUser(SEXY_DADDY_USER_ID);
    const res = await request(server.app).get(`/slug/${UWU_REALM_SLUG}`);

    expect(res.status).toBe(200);
    expect(res.body.realm_permissions.length).toBe(
      REALM_MEMBER_PERMISSIONS.length
    );
    expect(res.body.realm_permissions).toEqual(REALM_MEMBER_PERMISSIONS);
  });

  test("doesn't fetch realm permissions when user doesn't have realm permissions", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).get(
      `/slug/${TWISTED_MINDS_REALM_SLUG}`
    );

    expect(res.status).toBe(200);
    expect(res.body.realm_permissions).toEqual([]);
  });

  test("doesn't fetch realm permissions when logged out", async () => {
    const res = await request(server.app).get(
      `/slug/${TWISTED_MINDS_REALM_SLUG}`
    );

    expect(res.status).toBe(200);
    expect(res.body.realm_permissions).toEqual([]);
  });
});
