import {
  BOBATAN_USER_ID,
  JERSEY_DEVIL_USER_ID,
  ONCEST_USER_ID,
  SEXY_DADDY_USER_ID,
  ZODIAC_KILLER_USER_ID,
} from "test/data/auth";
import {
  TWISTED_MINDS_REALM_SLUG,
  TWISTED_MINDS_REALM_STRING_ID,
} from "test/data/realms";
import { setLoggedInUser, startTestServer } from "utils/test-utils";

import request from "supertest";
import router from "../routes";

jest.mock("handlers/auth");

describe("Tests create invites endpoint", () => {
  const server = startTestServer(router);

  test("creates invite when user only has role with correct permission", async () => {
    setLoggedInUser(SEXY_DADDY_USER_ID);
    const res = await request(server.app)
      .post(`/${TWISTED_MINDS_REALM_STRING_ID}/invites`)
      .send({ email: "anemail@email.com" });

    expect(res.status).toBe(200);
    const expected = `https://${TWISTED_MINDS_REALM_SLUG}.boba.social/invites/`;
    expect(res.body.invite_url).toEqual(expect.stringContaining(expected));
    expect(res.body.realm_id).toEqual(TWISTED_MINDS_REALM_STRING_ID);
  });

  test("creates invite with a label", async () => {
    setLoggedInUser(SEXY_DADDY_USER_ID);
    const res = await request(server.app)
      .post(`/${TWISTED_MINDS_REALM_STRING_ID}/invites`)
      .send({ email: "anemail@email.com", label: "a note about this invite" });

    expect(res.status).toBe(200);
    const expected = `https://${TWISTED_MINDS_REALM_SLUG}.boba.social/invites/`;
    expect(res.body.invite_url).toEqual(expect.stringContaining(expected));
    expect(res.body.realm_id).toEqual(TWISTED_MINDS_REALM_STRING_ID);
  });

  test("creates invite when user has correct permission plus another role", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app)
      .post(`/${TWISTED_MINDS_REALM_STRING_ID}/invites`)
      .send({ email: "anemail@email.com" });

    expect(res.status).toBe(200);
    const expected = `https://${TWISTED_MINDS_REALM_SLUG}.boba.social/invites/`;
    expect(res.body.invite_url).toEqual(expect.stringContaining(expected));
    expect(res.body.realm_id).toEqual(TWISTED_MINDS_REALM_STRING_ID);
  });

  test("doesn't create invite when user has only incorrect permissions on realm", async () => {
    setLoggedInUser(ONCEST_USER_ID);
    const res = await request(server.app)
      .post(`/${TWISTED_MINDS_REALM_STRING_ID}/invites`)
      .field("email", "anemail@email.com");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "User does not have required permissions for realm operation."
    );
    expect(res.body.invite_url).toBeUndefined();
  });

  test("doesn't create invite when user has create_realm_invite permission on another realm", async () => {
    setLoggedInUser(ZODIAC_KILLER_USER_ID);
    const res = await request(server.app)
      .post(`/${TWISTED_MINDS_REALM_STRING_ID}/invites`)
      .field("email", "anemail@email.com");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "User does not have required permissions for realm operation."
    );
    expect(res.body.invite_url).toBeUndefined();
  });

  test("doesn't create invite when user has no roles", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);

    const res = await request(server.app)
      .post(`/${TWISTED_MINDS_REALM_STRING_ID}/invites`)
      .field("email", "anemail@email.com");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "User does not have required permissions for realm operation."
    );
    expect(res.body.invite_url).toBeUndefined();
  });

  test("doesn't create invite if requested realm doesn't exist", async () => {
    setLoggedInUser(SEXY_DADDY_USER_ID);

    const res = await request(server.app)
      .post(`/somenonsense/invites`)
      .field("email", "anemail@email.com");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("The realm was not found.");
    expect(res.body.invite_url).toBeUndefined();
  });

  test("doesn't create invite if no email", async () => {
    setLoggedInUser(SEXY_DADDY_USER_ID);

    const res = await request(server.app).post(
      `/${TWISTED_MINDS_REALM_STRING_ID}/invites`
    );

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Request does not contain required email.");
    expect(res.body.invite_url).toBeUndefined();
  });

  test("doesn't create invite if email is an empty string", async () => {
    setLoggedInUser(SEXY_DADDY_USER_ID);

    const res = await request(server.app)
      .post(`/${TWISTED_MINDS_REALM_STRING_ID}/invites`)
      .field("email", "");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Request does not contain required email.");
    expect(res.body.invite_url).toBeUndefined();
  });

  test("doesn't create invite when logged out", async () => {
    const res = await request(server.app)
      .post(`/${TWISTED_MINDS_REALM_STRING_ID}/invites`)
      .field("email", "anemail@email.com");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("No authenticated user found.");
    expect(res.body.invite_url).toBeUndefined();
  });
});
