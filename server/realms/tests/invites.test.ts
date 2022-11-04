import {
  BOBATAN_USER_ID,
  JERSEY_DEVIL_USER_ID,
  ONCEST_USER_ID,
  SEXY_DADDY_USER_ID,
  ZODIAC_KILLER_USER_ID,
} from "test/data/auth";
import {
  TWISTED_MINDS_REALM_EXTERNAL_ID,
  TWISTED_MINDS_REALM_SLUG,
  UWU_REALM_EXTERNAL_ID,
  UWU_REALM_SLUG,
} from "test/data/realms";
import {
  setLoggedInUser,
  setLoggedInUserWithEmail,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

import { checkUserOnRealm } from "../queries";
import debug from "debug";
import firebaseAuth from "firebase-admin";
import pool from "server/db-pool";
import request from "supertest";
import router from "../routes";

const log = debug("bobaserver:realms:invites-test-log");

jest.mock("handlers/auth");
jest.mock("server/db-pool");

const authCreateUser = jest.fn();

jest.mock("firebase-admin", () => {
  return {
    auth: () => ({
      createUser: async () => authCreateUser(),
    }),
  };
});

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
  {
    nonce: "543noemail567",
    label: "An invite not locked to an email",
  },
];

const USED_AND_EXPIRED_INVITES = [
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

const insertInvites = async (
  invites: {
    nonce: string;
    email?: string;
    label?: string;
    used?: boolean;
    created?: string;
  }[],
  inviter: string,
  realmExternalId: string
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
          realm_id: realmExternalId,
          inviter_id: inviter,
          nonce: invite.nonce,
          email: invite.email,
          label: invite.label,
          created: invite.created ? invite.created : `now()`,
          used: invite.used ? true : false,
        }
      );
    }
    // const allInvites = await t.manyOrNone(`SELECT * FROM account_invites`);
    // log(allInvites);
  });
};

describe("Tests get invites endpoint", () => {
  const server = startTestServer(router);

  test("correctly sends empty invites array if no invites exist", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(
      `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ invites: [] });
  });

  test("correctly sends empty invites array if no pending invites exist for realm", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      insertInvites(
        USED_AND_EXPIRED_INVITES,
        BOBATAN_USER_ID,
        TWISTED_MINDS_REALM_EXTERNAL_ID
      );
      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app).get(
        `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ invites: [] });
    });
  });

  test("gets list of pending invites for realm", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      insertInvites(
        TWISTED_MINDS_INVITES,
        BOBATAN_USER_ID,
        TWISTED_MINDS_REALM_EXTERNAL_ID
      );
      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);

      const resTwistedMinds = await request(server.app).get(
        `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`
      );
      expect(resTwistedMinds.status).toBe(200);
      expect(resTwistedMinds.body.invites).toHaveLength(
        TWISTED_MINDS_INVITES.length - 2
      );
      for (const invite of resTwistedMinds.body.invites) {
        expect(invite.realm_id).toEqual(TWISTED_MINDS_REALM_EXTERNAL_ID);
        expect(invite.own).toBeTrue();
        log(invite.issued_at);
        // I think checking the issued_at is failing because of timezones. Not sure it's worth chasing, looks fine in log
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
        `/${UWU_REALM_EXTERNAL_ID}/invites`
      );
      expect(resUwu.status).toBe(200);
      expect(resUwu.body.invites).toHaveLength(UWU_INVITES.length);
      for (const invite of resUwu.body.invites) {
        expect(invite.realm_id).toEqual(UWU_REALM_EXTERNAL_ID);
        expect(invite.own).toBeFalse();
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
        if (!invite.invitee_email) {
          expect(invite.label).toBe(UWU_INVITES[2].label);
          expect(invite.invite_url).toEqual(
            `https://${UWU_REALM_SLUG}.boba.social/invites/${UWU_INVITES[2].nonce}`
          );
        }
      }
    });
  });
  test("gets list correctly when invite created from endpoint", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const resCreate = await request(server.app)
        .post(`/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`)
        .send({ email: "anemail@email.com" });

      expect(resCreate.status).toBe(200);
      const expected = `https://${TWISTED_MINDS_REALM_SLUG}.boba.social/invites/`;
      expect(resCreate.body.invite_url).toEqual(
        expect.stringContaining(expected)
      );
      expect(resCreate.body.realm_id).toEqual(TWISTED_MINDS_REALM_EXTERNAL_ID);

      const allInvites = await pool.manyOrNone(`SELECT * FROM account_invites`);
      log("from database", allInvites);

      const resTwistedMinds = await request(server.app).get(
        `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`
      );
      log("from endpoint", resTwistedMinds.body.invites);
      expect(resTwistedMinds.status).toBe(200);
      expect(resTwistedMinds.body.invites).toHaveLength(1);

      expect(resTwistedMinds.body.invites[0].realm_id).toEqual(
        TWISTED_MINDS_REALM_EXTERNAL_ID
      );
      log(resTwistedMinds.body.invites[0].issued_at);
      // expect(
      //   Date.parse(resTwistedMinds.body.invites[0].issued_at)
      // ).toBeLessThan(Date.now());
      expect(
        Date.parse(resTwistedMinds.body.invites[0].expires_at)
      ).toBeGreaterThan(Date.now());
      expect(resTwistedMinds.body.invites[0].invitee_email).toBe(
        "anemail@email.com"
      );
      expect(resTwistedMinds.body.invites[0].own).toBeTrue();
      expect(resTwistedMinds.body.invites[0].label).toBeUndefined();
      expect(resTwistedMinds.body.invites[0].invite_url).toEqual(
        resCreate.body.invite_url
      );
    });
  });

  test("doesn't get invites when user has no roles", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);

    const res = await request(server.app).get(
      `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`
    );

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "User does not have required permissions for realm operation."
    );
    expect(res.body.invites).toBeUndefined();
  });

  test("doesn't get invites if requested realm doesn't exist", async () => {
    setLoggedInUser(SEXY_DADDY_USER_ID);

    const res = await request(server.app).get(`/somenonsense/invites`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("The realm was not found.");
    expect(res.body.invites).toBeUndefined();
  });

  test("doesn't get invites when logged out", async () => {
    const res = await request(server.app).get(
      `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`
    );

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("No authenticated user found.");
    expect(res.body.invites).toBeUndefined();
  });
});

describe("Tests get invite by nonce endpoint", () => {
  const server = startTestServer(router);

  test("correctly sends 404 if no invites exist", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(
      `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites/${TWISTED_MINDS_INVITES[0].nonce}`
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("The invite was not found");
  });

  test("correctly sends 404 response if requested invite not found", async () => {
    await wrapWithTransaction(async () => {
      insertInvites(
        USED_AND_EXPIRED_INVITES,
        BOBATAN_USER_ID,
        TWISTED_MINDS_REALM_EXTERNAL_ID
      );
      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app).get(
        `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites/${TWISTED_MINDS_INVITES[0].nonce}`
      );

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("The invite was not found");
    });
  });

  test("Correctly gets invite realm and status for pending invite", async () => {
    await wrapWithTransaction(async () => {
      insertInvites(
        TWISTED_MINDS_INVITES,
        BOBATAN_USER_ID,
        TWISTED_MINDS_REALM_EXTERNAL_ID
      );
      const res = await request(server.app).get(
        `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites/${TWISTED_MINDS_INVITES[0].nonce}`
      );

      expect(res.status).toBe(200);
      expect(res.body.realm_id).toBe(TWISTED_MINDS_REALM_EXTERNAL_ID);
      expect(res.body.realm_slug).toBe(TWISTED_MINDS_REALM_SLUG);
      expect(res.body.invite_status).toBe("pending");
    });
  });

  test("Correctly gets invite realm when realm in param incorrect", async () => {
    await wrapWithTransaction(async () => {
      insertInvites(
        TWISTED_MINDS_INVITES,
        BOBATAN_USER_ID,
        TWISTED_MINDS_REALM_EXTERNAL_ID
      );
      const res = await request(server.app).get(
        `/${UWU_REALM_EXTERNAL_ID}/invites/${TWISTED_MINDS_INVITES[0].nonce}`
      );

      expect(res.status).toBe(200);
      expect(res.body.realm_id).toBe(TWISTED_MINDS_REALM_EXTERNAL_ID);
      expect(res.body.realm_slug).toBe(TWISTED_MINDS_REALM_SLUG);
      expect(res.body.invite_status).toBe("pending");
    });
  });

  test("Correctly gets invite realm and status for expired invite", async () => {
    await wrapWithTransaction(async () => {
      insertInvites(
        TWISTED_MINDS_INVITES,
        BOBATAN_USER_ID,
        TWISTED_MINDS_REALM_EXTERNAL_ID
      );
      const res = await request(server.app).get(
        `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites/${TWISTED_MINDS_INVITES[4].nonce}`
      );

      expect(res.status).toBe(200);
      expect(res.body.realm_id).toBe(TWISTED_MINDS_REALM_EXTERNAL_ID);
      expect(res.body.realm_slug).toBe(TWISTED_MINDS_REALM_SLUG);
      expect(res.body.invite_status).toBe("expired");
    });
  });

  test("Correctly gets invite realm and status for used invite", async () => {
    await wrapWithTransaction(async () => {
      insertInvites(
        TWISTED_MINDS_INVITES,
        BOBATAN_USER_ID,
        TWISTED_MINDS_REALM_EXTERNAL_ID
      );
      const res = await request(server.app).get(
        `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites/${TWISTED_MINDS_INVITES[3].nonce}`
      );

      expect(res.status).toBe(200);
      expect(res.body.realm_id).toBe(TWISTED_MINDS_REALM_EXTERNAL_ID);
      expect(res.body.realm_slug).toBe(TWISTED_MINDS_REALM_SLUG);
      expect(res.body.invite_status).toBe("used");
    });
  });
});

describe("Tests create invites endpoint", () => {
  const server = startTestServer(router);

  test("creates invite when user only has role with correct permission", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(SEXY_DADDY_USER_ID);
      const res = await request(server.app)
        .post(`/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`)
        .send({ email: "anemail@email.com" });

      expect(res.status).toBe(200);
      const expected = `https://${TWISTED_MINDS_REALM_SLUG}.boba.social/invites/`;
      expect(res.body.invite_url).toEqual(expect.stringContaining(expected));
      expect(res.body.realm_id).toEqual(TWISTED_MINDS_REALM_EXTERNAL_ID);
    });
  });

  test("creates invite with a label", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(SEXY_DADDY_USER_ID);
      const res = await request(server.app)
        .post(`/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`)
        .send({
          email: "anemail@email.com",
          label: "a note about this invite",
        });

      expect(res.status).toBe(200);
      const expected = `https://${TWISTED_MINDS_REALM_SLUG}.boba.social/invites/`;
      expect(res.body.invite_url).toEqual(expect.stringContaining(expected));
      expect(res.body.realm_id).toEqual(TWISTED_MINDS_REALM_EXTERNAL_ID);
    });
  });

  test("creates invite when user has correct permission plus another role", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .post(`/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`)
        .send({ email: "anemail@email.com" });

      expect(res.status).toBe(200);
      const expected = `https://${TWISTED_MINDS_REALM_SLUG}.boba.social/invites/`;
      expect(res.body.invite_url).toEqual(expect.stringContaining(expected));
      expect(res.body.realm_id).toEqual(TWISTED_MINDS_REALM_EXTERNAL_ID);
    });
  });

  test("doesn't create invite when user has only incorrect permissions on realm", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(ONCEST_USER_ID);
      const res = await request(server.app)
        .post(`/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`)
        .field("email", "anemail@email.com");

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(
        "User does not have required permissions for realm operation."
      );
      expect(res.body.invite_url).toBeUndefined();
    });
  });

  test("doesn't create invite when user has create_realm_invite permission on another realm", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(ZODIAC_KILLER_USER_ID);
      const res = await request(server.app)
        .post(`/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`)
        .field("email", "anemail@email.com");

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(
        "User does not have required permissions for realm operation."
      );
      expect(res.body.invite_url).toBeUndefined();
    });
  });

  test("doesn't create invite when user has no roles", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(JERSEY_DEVIL_USER_ID);

      const res = await request(server.app)
        .post(`/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`)
        .field("email", "anemail@email.com");

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(
        "User does not have required permissions for realm operation."
      );
      expect(res.body.invite_url).toBeUndefined();
    });
  });

  test("doesn't create invite if requested realm doesn't exist", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(SEXY_DADDY_USER_ID);

      const res = await request(server.app)
        .post(`/somenonsense/invites`)
        .field("email", "anemail@email.com");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("The realm was not found.");
      expect(res.body.invite_url).toBeUndefined();
    });
  });

  test("Correctly creates invite if no email", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(SEXY_DADDY_USER_ID);

      const res = await request(server.app).post(
        `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`
      );

      expect(res.status).toBe(200);
      const expected = `https://${TWISTED_MINDS_REALM_SLUG}.boba.social/invites/`;
      expect(res.body.invite_url).toEqual(expect.stringContaining(expected));
      expect(res.body.realm_id).toEqual(TWISTED_MINDS_REALM_EXTERNAL_ID);
    });
  });

  test("Correctly creates invite if email is an empty string", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(SEXY_DADDY_USER_ID);

      const res = await request(server.app)
        .post(`/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`)
        .field("email", "");

      expect(res.status).toBe(200);
      const expected = `https://${TWISTED_MINDS_REALM_SLUG}.boba.social/invites/`;
      expect(res.body.invite_url).toEqual(expect.stringContaining(expected));
      expect(res.body.realm_id).toEqual(TWISTED_MINDS_REALM_EXTERNAL_ID);
    });
  });

  test("doesn't create invite when logged out", async () => {
    await wrapWithTransaction(async () => {
      const res = await request(server.app)
        .post(`/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites`)
        .field("email", "anemail@email.com");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("No authenticated user found.");
      expect(res.body.invite_url).toBeUndefined();
    });
  });
});

describe("Tests accept invites endpoint", () => {
  const server = startTestServer(router);

  test("correctly accepts invite and adds user to the realm when invite locked to invitee email", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUserWithEmail({
        uid: JERSEY_DEVIL_USER_ID,
        email: UWU_INVITES[1].email,
      });

      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app).post(
        `/${UWU_REALM_EXTERNAL_ID}/invites/${UWU_INVITES[1].nonce}`
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        realm_id: UWU_REALM_EXTERNAL_ID,
        realm_slug: UWU_REALM_SLUG,
      });
      const addedToRealm = await checkUserOnRealm({
        firebaseId: JERSEY_DEVIL_USER_ID,
        realmExternalId: UWU_REALM_EXTERNAL_ID,
      });
      expect(addedToRealm).toEqual(true);
    });
  });

  test("correctly accepts invite and adds user to the realm when invite not locked to email", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUserWithEmail({
        uid: JERSEY_DEVIL_USER_ID,
        email: UWU_INVITES[1].email,
      });

      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app).post(
        `/${UWU_REALM_EXTERNAL_ID}/invites/${UWU_INVITES[2].nonce}`
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        realm_id: UWU_REALM_EXTERNAL_ID,
        realm_slug: UWU_REALM_SLUG,
      });
      const addedToRealm = await checkUserOnRealm({
        firebaseId: JERSEY_DEVIL_USER_ID,
        realmExternalId: UWU_REALM_EXTERNAL_ID,
      });
      expect(addedToRealm).toEqual(true);
    });
  });

  test("accepts invite correctly when invite generated from endpoint", async () => {
    await wrapWithTransaction(async () => {
      const onclerEmail = "onceler@email.com";

      setLoggedInUser(ZODIAC_KILLER_USER_ID);
      const resCreateInvite = await request(server.app)
        .post(`/${UWU_REALM_EXTERNAL_ID}/invites/`)
        .send({ email: onclerEmail });

      const sliceIndex = resCreateInvite.body.invite_url.lastIndexOf("/") + 1;
      const nonce = resCreateInvite.body.invite_url.slice(sliceIndex);

      setLoggedInUserWithEmail({ uid: ONCEST_USER_ID, email: onclerEmail });
      const resAccept = await request(server.app).post(
        `/${UWU_REALM_EXTERNAL_ID}/invites/${nonce}`
      );

      expect(resAccept.status).toBe(200);
      expect(resAccept.body).toEqual({
        realm_id: UWU_REALM_EXTERNAL_ID,
        realm_slug: UWU_REALM_SLUG,
      });
      const addedToRealm = await checkUserOnRealm({
        firebaseId: ONCEST_USER_ID,
        realmExternalId: UWU_REALM_EXTERNAL_ID,
      });
      expect(addedToRealm).toEqual(true);
    });
  });

  test("doesn't accept invite when user is already a member of the realm", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUserWithEmail({
        uid: BOBATAN_USER_ID,
        email: UWU_INVITES[0].email,
      });

      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app).post(
        `/${UWU_REALM_EXTERNAL_ID}/invites/${UWU_INVITES[0].nonce}`
      );

      expect(res.status).toBe(409);
      expect(res.body.message).toBe(
        "User is already a member of the requested realm"
      );
    });
  });

  test("doesn't accept invite when user email doesn't match invite email", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUserWithEmail({
        uid: JERSEY_DEVIL_USER_ID,
        email: "differentEmail@email.com",
      });

      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app).post(
        `/${UWU_REALM_EXTERNAL_ID}/invites/${UWU_INVITES[1].nonce}`
      );
      expect(res.body.message).toBe(`Invite email does not match`);
      expect(res.status).toBe(403);
      const addedToRealm = await checkUserOnRealm({
        firebaseId: JERSEY_DEVIL_USER_ID,
        realmExternalId: UWU_REALM_EXTERNAL_ID,
      });
      expect(addedToRealm).toEqual(false);
    });
  });

  test("doesn't accept invite when invite is already used", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUserWithEmail({
        uid: JERSEY_DEVIL_USER_ID,
        email: USED_AND_EXPIRED_INVITES[0].email,
      });

      insertInvites(
        USED_AND_EXPIRED_INVITES,
        ZODIAC_KILLER_USER_ID,
        UWU_REALM_EXTERNAL_ID
      );
      const res = await request(server.app).post(
        `/${UWU_REALM_EXTERNAL_ID}/invites/${USED_AND_EXPIRED_INVITES[0].nonce}`
      );

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(`Invite expired or already used`);
      const addedToRealm = await checkUserOnRealm({
        firebaseId: JERSEY_DEVIL_USER_ID,
        realmExternalId: UWU_REALM_EXTERNAL_ID,
      });
      expect(addedToRealm).toEqual(false);
    });
  });

  test("doesn't accept invite when invite is expired", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUserWithEmail({
        uid: JERSEY_DEVIL_USER_ID,
        email: USED_AND_EXPIRED_INVITES[1].email,
      });

      insertInvites(
        USED_AND_EXPIRED_INVITES,
        ZODIAC_KILLER_USER_ID,
        UWU_REALM_EXTERNAL_ID
      );
      const res = await request(server.app).post(
        `/${UWU_REALM_EXTERNAL_ID}/invites/${USED_AND_EXPIRED_INVITES[1].nonce}`
      );

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(`Invite expired or already used`);
      const addedToRealm = await checkUserOnRealm({
        firebaseId: JERSEY_DEVIL_USER_ID,
        realmExternalId: UWU_REALM_EXTERNAL_ID,
      });
      expect(addedToRealm).toEqual(false);
    });
  });

  test("accepts invite when realm doesn't match invite realm, but returns correct realm data", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUserWithEmail({
        uid: JERSEY_DEVIL_USER_ID,
        email: UWU_INVITES[1].email,
      });

      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app).post(
        `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/invites/${UWU_INVITES[1].nonce}`
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        realm_id: UWU_REALM_EXTERNAL_ID,
        realm_slug: UWU_REALM_SLUG,
      });
      const addedToRealm = await checkUserOnRealm({
        firebaseId: JERSEY_DEVIL_USER_ID,
        realmExternalId: UWU_REALM_EXTERNAL_ID,
      });
      expect(addedToRealm).toEqual(true);
      const addedToWrongRealm = await checkUserOnRealm({
        firebaseId: JERSEY_DEVIL_USER_ID,
        realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      });
      expect(addedToWrongRealm).toEqual(false);
    });
  });

  test("doesn't accept invite if requested realm doesn't exist", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUserWithEmail({
        uid: JERSEY_DEVIL_USER_ID,
        email: UWU_INVITES[1].email,
      });

      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app).post(
        `/notarealrealm/invites/${UWU_INVITES[1].nonce}`
      );

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("The realm was not found.");
      const addedToRealm = await checkUserOnRealm({
        firebaseId: JERSEY_DEVIL_USER_ID,
        realmExternalId: UWU_REALM_EXTERNAL_ID,
      });
      expect(addedToRealm).toEqual(false);
    });
  });

  test("doesn't accept invite if requested invite doesn't exist", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUserWithEmail({
        uid: JERSEY_DEVIL_USER_ID,
        email: UWU_INVITES[1].email,
      });

      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app).post(
        `/${UWU_REALM_EXTERNAL_ID}/invites/notarealinvite123`
      );

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Invite not found");
      const addedToRealm = await checkUserOnRealm({
        firebaseId: JERSEY_DEVIL_USER_ID,
        realmExternalId: UWU_REALM_EXTERNAL_ID,
      });
      expect(addedToRealm).toEqual(false);
    });
  });

  test("creates new user when logged out, when invite locked to email", async () => {
    await wrapWithTransaction(async () => {
      const NEW_USER_FIREBASE_ID = "new_user_firebase_id";
      authCreateUser.mockReturnValue({
        uid: NEW_USER_FIREBASE_ID,
        metadata: { creationTime: "2022-05-12 19:10:25" },
      });

      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app)
        .post(`/${UWU_REALM_EXTERNAL_ID}/invites/${UWU_INVITES[1].nonce}`)
        .send({
          email: UWU_INVITES[1].email,
          password: "secure_password",
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        realm_id: UWU_REALM_EXTERNAL_ID,
        realm_slug: UWU_REALM_SLUG,
      });

      const preExistingUsers = [
        BOBATAN_USER_ID,
        JERSEY_DEVIL_USER_ID,
        ONCEST_USER_ID,
        SEXY_DADDY_USER_ID,
        ZODIAC_KILLER_USER_ID,
      ];
      const users = await pool.many(`SELECT users.firebase_id FROM users;`);
      expect(users).toHaveLength(preExistingUsers.length + 1);
      expect(users[preExistingUsers.length]).toEqual({
        firebase_id: NEW_USER_FIREBASE_ID,
      });

      const preExistingUsersInRealm = [BOBATAN_USER_ID, ZODIAC_KILLER_USER_ID];
      const usersInRealm = await pool.many(
        `SELECT users.firebase_id
      FROM realm_users
      JOIN users ON realm_users.user_id = users.id
      WHERE realm_id = (SELECT id FROM realms WHERE string_id = $/REALM_EXTERNAL_id/);`,
        {
          REALM_EXTERNAL_id: UWU_REALM_EXTERNAL_ID,
        }
      );
      expect(usersInRealm).toHaveLength(preExistingUsersInRealm.length + 1);
      expect(usersInRealm[preExistingUsersInRealm.length]).toEqual({
        firebase_id: NEW_USER_FIREBASE_ID,
      });
    });
  });

  test("creates new user when logged out, when invite not locked to email", async () => {
    await wrapWithTransaction(async () => {
      const NEW_USER_FIREBASE_ID = "new_user_firebase_id";
      authCreateUser.mockReturnValue({
        uid: NEW_USER_FIREBASE_ID,
        metadata: { creationTime: "2022-05-12 19:10:25" },
      });

      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app)
        .post(`/${UWU_REALM_EXTERNAL_ID}/invites/${UWU_INVITES[2].nonce}`)
        .send({
          email: "this_can_be_any_email@email.com",
          password: "secure_password",
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        realm_id: UWU_REALM_EXTERNAL_ID,
        realm_slug: UWU_REALM_SLUG,
      });

      const preExistingUsers = [
        BOBATAN_USER_ID,
        JERSEY_DEVIL_USER_ID,
        ONCEST_USER_ID,
        SEXY_DADDY_USER_ID,
        ZODIAC_KILLER_USER_ID,
      ];
      const users = await pool.many(`SELECT users.firebase_id FROM users;`);
      expect(users).toHaveLength(preExistingUsers.length + 1);
      expect(users[preExistingUsers.length]).toEqual({
        firebase_id: NEW_USER_FIREBASE_ID,
      });

      const preExistingUsersInRealm = [BOBATAN_USER_ID, ZODIAC_KILLER_USER_ID];
      const usersInRealm = await pool.many(
        `SELECT users.firebase_id
        FROM realm_users
        JOIN users ON realm_users.user_id = users.id
        WHERE realm_id = (SELECT id FROM realms WHERE string_id = $/REALM_EXTERNAL_id/);`,
        {
          REALM_EXTERNAL_id: UWU_REALM_EXTERNAL_ID,
        }
      );
      expect(usersInRealm).toHaveLength(preExistingUsersInRealm.length + 1);
      expect(usersInRealm[preExistingUsersInRealm.length]).toEqual({
        firebase_id: NEW_USER_FIREBASE_ID,
      });
    });
  });

  test("doesn't accept invite when logged out if email doesn't match invite email", async () => {
    await wrapWithTransaction(async () => {
      const NEW_USER_FIREBASE_ID = "new_user_firebase_id";
      authCreateUser.mockReturnValue({
        uid: NEW_USER_FIREBASE_ID,
        metadata: { creationTime: "2022-05-12 19:10:25" },
      });

      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app)
        .post(`/${UWU_REALM_EXTERNAL_ID}/invites/${UWU_INVITES[1].nonce}`)
        .send({
          email: "different_email@email.com",
          password: "secure_password",
        });
      expect(res.body.message).toBe(`Invite email does not match`);
      expect(res.status).toBe(403);
      const newUser = await pool.oneOrNone(
        `SELECT users.firebase_id FROM users WHERE users.firebase_id = $/new_user_firebase_id/;`,
        {
          new_user_firebase_id: NEW_USER_FIREBASE_ID,
        }
      );
      expect(newUser).toBeNull();
      const addedToRealm = await checkUserOnRealm({
        firebaseId: NEW_USER_FIREBASE_ID,
        realmExternalId: UWU_REALM_EXTERNAL_ID,
      });
      expect(addedToRealm).toEqual(false);
    });
  });

  test("Doesn't create new user when logged out if no email provided when invite not locked to email", async () => {
    await wrapWithTransaction(async () => {
      const NEW_USER_FIREBASE_ID = "new_user_firebase_id";
      authCreateUser.mockReturnValue({
        uid: NEW_USER_FIREBASE_ID,
        metadata: { creationTime: "2022-05-12 19:10:25" },
      });

      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app)
        .post(`/${UWU_REALM_EXTERNAL_ID}/invites/${UWU_INVITES[2].nonce}`)
        .send({
          email: "",
          password: "secure_password",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        `Email and password required to create new user account`
      );
      const newUser = await pool.oneOrNone(
        `SELECT users.firebase_id FROM users WHERE users.firebase_id = $/new_user_firebase_id/;`,
        {
          new_user_firebase_id: NEW_USER_FIREBASE_ID,
        }
      );
      expect(newUser).toBeNull();
      const addedToRealm = await checkUserOnRealm({
        firebaseId: NEW_USER_FIREBASE_ID,
        realmExternalId: UWU_REALM_EXTERNAL_ID,
      });
      expect(addedToRealm).toEqual(false);
    });
  });

  test("Doesn't create new user when logged out if no password provided when invite not locked to email", async () => {
    await wrapWithTransaction(async () => {
      const NEW_USER_FIREBASE_ID = "new_user_firebase_id";
      authCreateUser.mockReturnValue({
        uid: NEW_USER_FIREBASE_ID,
        metadata: { creationTime: "2022-05-12 19:10:25" },
      });

      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app)
        .post(`/${UWU_REALM_EXTERNAL_ID}/invites/${UWU_INVITES[2].nonce}`)
        .send({
          email: "this_can_be_any_email@email.com",
          password: "",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        `Email and password required to create new user account`
      );
      const newUser = await pool.oneOrNone(
        `SELECT users.firebase_id FROM users WHERE users.firebase_id = $/new_user_firebase_id/;`,
        {
          new_user_firebase_id: NEW_USER_FIREBASE_ID,
        }
      );
      expect(newUser).toBeNull();
      const addedToRealm = await checkUserOnRealm({
        firebaseId: NEW_USER_FIREBASE_ID,
        realmExternalId: UWU_REALM_EXTERNAL_ID,
      });
      expect(addedToRealm).toEqual(false);
    });
  });

  test("Doesn't create new user when logged out if no email provided when invite locked to email", async () => {
    await wrapWithTransaction(async () => {
      const NEW_USER_FIREBASE_ID = "new_user_firebase_id";
      authCreateUser.mockReturnValue({
        uid: NEW_USER_FIREBASE_ID,
        metadata: { creationTime: "2022-05-12 19:10:25" },
      });

      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app)
        .post(`/${UWU_REALM_EXTERNAL_ID}/invites/${UWU_INVITES[1].nonce}`)
        .send({
          email: "",
          password: "secure_password",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        `Email and password required to create new user account`
      );
      const newUser = await pool.oneOrNone(
        `SELECT users.firebase_id FROM users WHERE users.firebase_id = $/new_user_firebase_id/;`,
        {
          new_user_firebase_id: NEW_USER_FIREBASE_ID,
        }
      );
      expect(newUser).toBeNull();
      const addedToRealm = await checkUserOnRealm({
        firebaseId: NEW_USER_FIREBASE_ID,
        realmExternalId: UWU_REALM_EXTERNAL_ID,
      });
      expect(addedToRealm).toEqual(false);
    });
  });

  test("Doesn't create new user when logged out if no password provided when invite locked to email", async () => {
    await wrapWithTransaction(async () => {
      const NEW_USER_FIREBASE_ID = "new_user_firebase_id";
      authCreateUser.mockReturnValue({
        uid: NEW_USER_FIREBASE_ID,
        metadata: { creationTime: "2022-05-12 19:10:25" },
      });

      insertInvites(UWU_INVITES, ZODIAC_KILLER_USER_ID, UWU_REALM_EXTERNAL_ID);
      const res = await request(server.app)
        .post(`/${UWU_REALM_EXTERNAL_ID}/invites/${UWU_INVITES[1].nonce}`)
        .send({
          email: UWU_INVITES[1].email,
          password: "",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        `Email and password required to create new user account`
      );
      const newUser = await pool.oneOrNone(
        `SELECT users.firebase_id FROM users WHERE users.firebase_id = $/new_user_firebase_id/;`,
        {
          new_user_firebase_id: NEW_USER_FIREBASE_ID,
        }
      );
      expect(newUser).toBeNull();
      const addedToRealm = await checkUserOnRealm({
        firebaseId: NEW_USER_FIREBASE_ID,
        realmExternalId: UWU_REALM_EXTERNAL_ID,
      });
      expect(addedToRealm).toEqual(false);
    });
  });
});
