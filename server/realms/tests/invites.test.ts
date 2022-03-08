import {
  BOBATAN_USER_ID,
  JERSEY_DEVIL_USER_ID,
  ONCEST_USER_ID,
  SEXY_DADDY_USER_ID,
  ZODIAC_KILLER_USER_ID,
} from "test/data/auth";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import request from "supertest";
import router from "../routes";

jest.mock("handlers/auth");

describe("Tests creating invite", () => {
  const server = startTestServer(router);
  describe("REST API", () => {
    test("creates invite when user only has role with correct permission", async () => {
      setLoggedInUser(SEXY_DADDY_USER_ID);
      const res = await request(server.app)
        .post("/1/invite/generate")
        .send({ email: "anemail@email.com" });

      expect(res.status).toBe(200);
      const expected = "https://v0.boba.social/invite/";
      expect(res.body.inviteUrl).toEqual(expect.stringContaining(expected));
    });

    test("creates invite when user has correct permission plus another role", async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .post("/1/invite/generate")
        .send({ email: "anemail@email.com" });

      expect(res.status).toBe(200);
      const expected = "https://v0.boba.social/invite/";
      expect(res.body.inviteUrl).toEqual(expect.stringContaining(expected));
    });

    test("doesn't create invite when user has only incorrect permissions on realm", async () => {
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

    test("doesn't create invite when user has create_invite permission on another realm", async () => {
      setLoggedInUser(ZODIAC_KILLER_USER_ID);
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

    test("doesn't create invite when user has no roles", async () => {
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
