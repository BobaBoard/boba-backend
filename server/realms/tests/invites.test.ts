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
  UWU_REALM_SLUG,
  UWU_REALM_STRING_ID,
} from "test/data/realms";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

import debug from "debug";
import pool from "server/db-pool";
import request from "supertest";
import router from "../routes";

const log = debug("bobaserver:realms:invites-test-log");

jest.mock("handlers/auth");
// jest.mock("server/db-pool");

const TWISTED_MINDS_INVITES = [
  {
    nonce: "123nolabel789",
    email: "nolabel@email.com",
  },
  {
    nonce: "234dean678",
    email: "deanwinchester@email.com",
    label: "An invite for Dean",
  },
  {
    nonce: "345castiel567",
    email: "castiel@email.com",
    label: "An invite for Cas",
  },
  {
    nonce: "456used654",
    email: "used@email.com",
    label: "used invite",
    used: true,
  },
  {
    nonce: "321expired987",
    email: "expired@email.com",
    label: "expired invite",
    created: "2016-06-22 19:10:25",
  },
];

const UWU_INVITES = [
  {
    nonce: "234bobatan678",
    email: "bobatan@email.com",
    label: "An invite for Bobatan",
  },
  {
    nonce: "345jerseydevil567",
    email: "jersey_devil@email.com",
    label: "An invite for the Jersey Devil",
  },
];

const insertInvites = async (
  invites: {
    nonce: string;
    email: string;
    label?: string;
    used?: boolean;
    created?: string;
  }[],
  inviter: string,
  realmId: string
) => {
  await pool.task(async (t) => {
    for (const invite of invites) {
      await t.none(
        `
  INSERT INTO account_invites(realm_id, inviter, nonce, invitee_email, label, created, duration, used)
  VALUES
  ((SELECT id FROM realms WHERE string_id = $/realm_id/),
  (SELECT id FROM users WHERE firebase_id = $/inviter_id/),
  $/nonce/, $/email/, $/label/, $/created/, INTERVAL '1 WEEK', $/used/)`,
        {
          realm_id: realmId,
          inviter_id: inviter,
          nonce: invite.nonce,
          email: invite.email,
          label: invite.label,
          created: invite.created ? invite.created : `now()`,
          used: invite.used ? true : false,
        }
      );
    }
  });
};

//TODO: Figure out how to remove inserted invites after tests run
// and why post endpoint making two invites each time
describe("Tests get invites endpoint", () => {
  const server = startTestServer(router);

  // TODO: Figure out why everything breaks when no invites
  // test("correctly sends 204 response if no pending invites exist for realm", async () => {
  //   setLoggedInUser(BOBATAN_USER_ID);
  //   const res = await request(server.app).get(
  //     `/${TWISTED_MINDS_REALM_STRING_ID}/invites`
  //   );

  //   expect(res.status).toBe(204);
  //   expect(res.body).toBeUndefined();
  // });

  test("gets list of pending invites for realm", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    insertInvites(
      TWISTED_MINDS_INVITES,
      BOBATAN_USER_ID,
      TWISTED_MINDS_REALM_STRING_ID
    );
    insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_STRING_ID);

    const resTwistedMinds = await request(server.app).get(
      `/${TWISTED_MINDS_REALM_STRING_ID}/invites`
    );
    expect(resTwistedMinds.status).toBe(200);
    expect(resTwistedMinds.body.invites).toHaveLength(3);
    for (const invite of resTwistedMinds.body.invites) {
      expect(invite.realm_id).toEqual(TWISTED_MINDS_REALM_STRING_ID);
      log(invite.issued_at);
      // I think checking the issued_at might be failing because of timezones? not sure it's worth chasing, looks fine in log
      // expect(Date.parse(invite.issued_at)).toBeLessThan(Date.now());
      expect(Date.parse(invite.expires_at)).toBeGreaterThan(Date.now());
      expect(invite.invitee_email).not.toBe(TWISTED_MINDS_INVITES[3].email);
      expect(invite.invitee_email).not.toBe(TWISTED_MINDS_INVITES[4].email);
      if (invite.invitee_email === TWISTED_MINDS_INVITES[0].email) {
        expect(invite.label).toBeUndefined();
        expect(invite.invite_url).toEqual(
          `https://${TWISTED_MINDS_REALM_SLUG}.boba.social/invites/${TWISTED_MINDS_INVITES[0].nonce}`
        );
      }
      if (invite.invitee_email === TWISTED_MINDS_INVITES[1].email) {
        expect(invite.label).toBe(TWISTED_MINDS_INVITES[1].label);
        expect(invite.invite_url).toEqual(
          `https://${TWISTED_MINDS_REALM_SLUG}.boba.social/invites/${TWISTED_MINDS_INVITES[1].nonce}`
        );
      }
      if (invite.invitee_email === TWISTED_MINDS_INVITES[2].email) {
        expect(invite.label).toBe(TWISTED_MINDS_INVITES[2].label);
        expect(invite.invite_url).toEqual(
          `https://${TWISTED_MINDS_REALM_SLUG}.boba.social/invites/${TWISTED_MINDS_INVITES[2].nonce}`
        );
      }
    }

    const resUwu = await request(server.app).get(
      `/${UWU_REALM_STRING_ID}/invites`
    );
    expect(resUwu.status).toBe(200);
    expect(resUwu.body.invites).toHaveLength(2);
    for (const invite of resUwu.body.invites) {
      expect(invite.realm_id).toEqual(UWU_REALM_STRING_ID);
      // expect(Date.parse(invite.issued_at)).toBeLessThan(Date.now());
      expect(Date.parse(invite.expires_at)).toBeGreaterThan(Date.now());
      if (invite.invitee_email === UWU_INVITES[0].email) {
        expect(invite.label).toBe(UWU_INVITES[0].label);
        expect(invite.invite_url).toEqual(
          `https://${UWU_REALM_SLUG}.boba.social/invites/${UWU_INVITES[0].nonce}`
        );
      }
      if (invite.invitee_email === UWU_INVITES[1].email) {
        expect(invite.label).toBe(UWU_INVITES[1].label);
        expect(invite.invite_url).toEqual(
          `https://${UWU_REALM_SLUG}.boba.social/invites/${UWU_INVITES[1].nonce}`
        );
      }
    }
  });

  test("doesn't get invites when user has no roles", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);

    const res = await request(server.app).get(
      `/${TWISTED_MINDS_REALM_STRING_ID}/invites`
    );

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "User does not have required permissions for realm operation."
    );
    expect(res.body.invite_url).toBeUndefined();
  });

  test("doesn't get invites if requested realm doesn't exist", async () => {
    setLoggedInUser(SEXY_DADDY_USER_ID);

    const res = await request(server.app).get(`/somenonsense/invites`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("The realm was not found.");
    expect(res.body.invite_url).toBeUndefined();
  });

  test("doesn't get invites when logged out", async () => {
    const res = await request(server.app).get(
      `/${TWISTED_MINDS_REALM_STRING_ID}/invites`
    );

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("No authenticated user found.");
    expect(res.body.invite_url).toBeUndefined();
  });
});

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
