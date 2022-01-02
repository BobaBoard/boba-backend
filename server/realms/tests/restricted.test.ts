import express, { Express } from "express";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { BOBATAN_USER_ID } from "test/data/auth";
import { RESTRICTED_BOARD_SUMMARY } from "test/data/boards";
import { Server } from "http";
import request from "supertest";
import router from "../routes";

jest.mock("handlers/auth");

describe("Tests restricted board realm queries", () => {
  const server = startTestServer(router);
  describe("REST API", () => {
    test("fetches board details when logged in (REST)", async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app).get("/slug/v0");

      expect(res.status).toBe(200);
      expect(
        res.body.boards.find((board: any) => board.slug == "restricted")
      ).toEqual(RESTRICTED_BOARD_SUMMARY.BOBATAN);
    });

    test("doesn't fetch restricted board details in realm query when logged out", async () => {
      const res = await request(server.app).get("/slug/v0");

      expect(res.status).toBe(200);
      expect(
        res.body.boards.find((board: any) => board.slug == "restricted")
      ).toEqual(RESTRICTED_BOARD_SUMMARY.LOGGED_OUT);
    });
  });
});
