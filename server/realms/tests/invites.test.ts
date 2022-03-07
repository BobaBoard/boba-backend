import { BoardMetadata, BoardSummary } from "types/rest/boards";
import { GORE_BOARD_METADATA, extractBoardSummary } from "test/data/boards";
import express, { Express } from "express";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import {
  BOBATAN_USER_ID,
  JERSEY_DEVIL_USER_ID,
  ONCEST_USER_ID,
} from "test/data/auth";
import request from "supertest";
import router from "../routes";

jest.mock("handlers/auth");

describe("Tests creating invite", () => {
  const server = startTestServer(router);
  describe("REST API", () => {
    test("creates invite when has correct permission", async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .post("/1/invite/generate")
        .send({ email: "anemail@email.com" });

      expect(res.status).toBe(200);
      const expected = "https://v0.boba.social/invite/";
      expect(res.body.inviteUrl).toEqual(expect.stringContaining(expected));
    });

    test("doesn't create invite when incorrect permissions", async () => {
      setLoggedInUser(ONCEST_USER_ID);
      const res = await request(server.app)
        .post("/1/invite/generate")
        .field("email", "anemail@email.com");

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(
        "User does not have required permissions for realm operation."
      );
      const expected = {
        inviteUrl: expect.stringContaining("https://v0.boba.social/invite/"),
      };
      expect(res.body).toEqual(expect.not.objectContaining(expected));
    });

    test("doesn't create invite when no permissions", async () => {
      setLoggedInUser(JERSEY_DEVIL_USER_ID);

      const res = await request(server.app)
        .post("/1/invite/generate")
        .field("email", "anemail@email.com");

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(
        "User does not have required permissions for realm operation."
      );
    });

    test("doesn't create invite when logged out", async () => {
      const res = await request(server.app)
        .post("/1/invite/generate")
        .field("email", "anemail@email.com");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("No authenticated user found.");
    });
  });
});
