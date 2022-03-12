import {
  BOBATAN_USER_ID,
  JERSEY_DEVIL_USER_ID,
  ONCEST_USER_ID,
  SEXY_DADDY_USER_ID,
  ZODIAC_KILLER_USER_ID,
} from "test/data/auth";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { TWISTED_MINDS_REALM_ID } from "test/data/realms";
import request from "supertest";
import router from "../routes";

jest.mock("handlers/auth");

describe("Tests creat invites endpoint", () => {
  const server = startTestServer(router);

  test("creates invite when user only has role with correct permission", async () => {
    setLoggedInUser(SEXY_DADDY_USER_ID);
    const res = await request(server.app)
      .post(`/${TWISTED_MINDS_REALM_ID}/invites`)
      .send({ email: "anemail@email.com" });

    expect(res.status).toBe(200);
    const expected = "https://v0.boba.social/invite/";
    expect(res.body.inviteUrl).toEqual(expect.stringContaining(expected));
  });

  test("creates invite when user has correct permission plus another role", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app)
      .post(`/${TWISTED_MINDS_REALM_ID}/invites`)
      .send({ email: "anemail@email.com" });

    expect(res.status).toBe(200);
    const expected = "https://v0.boba.social/invite/";
    expect(res.body.inviteUrl).toEqual(expect.stringContaining(expected));
  });

  test("doesn't create invite when user has only incorrect permissions on realm", async () => {
    setLoggedInUser(ONCEST_USER_ID);
    const res = await request(server.app)
      .post(`/${TWISTED_MINDS_REALM_ID}/invites`)
      .field("email", "anemail@email.com");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "User does not have required permissions for realm operation."
    );
    expect(res.body.inviteUrl).toBeUndefined();
  });

  test("doesn't create invite when user has create_realm_invite permission on another realm", async () => {
    setLoggedInUser(ZODIAC_KILLER_USER_ID);
    const res = await request(server.app)
      .post(`/${TWISTED_MINDS_REALM_ID}/invites`)
      .field("email", "anemail@email.com");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "User does not have required permissions for realm operation."
    );
    expect(res.body.inviteUrl).toBeUndefined();
  });

  test("doesn't create invite when user has no roles", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);

    const res = await request(server.app)
      .post(`/${TWISTED_MINDS_REALM_ID}/invites`)
      .field("email", "anemail@email.com");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "User does not have required permissions for realm operation."
    );
    expect(res.body.inviteUrl).toBeUndefined();
  });

  test("doesn't create invite when logged out", async () => {
    const res = await request(server.app)
      .post(`/${TWISTED_MINDS_REALM_ID}/invites`)
      .field("email", "anemail@email.com");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("No authenticated user found.");
    expect(res.body.inviteUrl).toBeUndefined();
  });
});
