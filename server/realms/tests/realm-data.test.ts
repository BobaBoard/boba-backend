import { BOBATAN_USER_ID, JERSEY_DEVIL_USER_ID } from "test/data/auth";
import { BoardMetadata, BoardSummary } from "types/rest/boards";
import { GORE_BOARD_METADATA, extractBoardSummary } from "test/data/boards";
import express, { Express } from "express";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { TWISTED_MINDS_REALM_SLUG } from "test/data/realms";
import request from "supertest";
import router from "../routes";

jest.mock("handlers/auth");

describe("Tests restricted board realm queries", () => {
  const server = startTestServer(router);
  describe("REST API", () => {
    test("fetches board details when logged in (REST)", async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app).get("/slug/twisted-minds");

      expect(res.status).toBe(200);
      expect(res.body.boards.length).toBe(7);
      expect(
        res.body.boards.find((board: any) => board.slug == "gore")
      ).toEqual(extractBoardSummary(GORE_BOARD_METADATA.BOBATAN));
    });

    test("doesn't fetch restricted board details in realm query when logged out", async () => {
      const res = await request(server.app).get("/slug/twisted-minds");

      expect(res.status).toBe(200);
      expect(res.body.boards.length).toBe(7);
      expect(
        res.body.boards.find((board: any) => board.slug == "gore")
      ).toEqual(extractBoardSummary(GORE_BOARD_METADATA.LOGGED_OUT));
    });

    test("fetches user realm permissions when user has realm permissions", async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app).get(
        `/slug/${TWISTED_MINDS_REALM_SLUG}`
      );

      expect(res.status).toBe(200);
      expect(res.body.realm_permissions.length).toBe(1);
      expect(res.body.realm_permissions[0]).toEqual("create_realm_invite");
    });

    test("doesn't fetch realm permissions when user doesn't have realm permissions", async () => {
      setLoggedInUser(JERSEY_DEVIL_USER_ID);
      const res = await request(server.app).get(
        `/slug/${TWISTED_MINDS_REALM_SLUG}`
      );

      expect(res.status).toBe(200);
      expect(res.body.realm_permissions).toBeUndefined();
    });

    test("doesn't fetch realm permissions when logged out", async () => {
      const res = await request(server.app).get(
        `/slug/${TWISTED_MINDS_REALM_SLUG}`
      );

      expect(res.status).toBe(200);
      expect(res.body.realm_permissions).toBeUndefined();
    });
  });
});
