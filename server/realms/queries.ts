import { filterOutDisabledSettings, getRealmCursorSetting } from "./utils";

import { CssVariableSetting } from "../../types/settings";
import { SettingEntry } from "../../types/settings";
import debug from "debug";
import { extractRealmPermissions } from "utils/permissions-utils";
import pool from "server/db-pool";
import sql from "./sql";

const log = debug("bobaserver:realms:queries-log");
const error = debug("bobaserver:realms:queries-error");

const CURSOR_SETTINGS = {
  // image: "https://cur.cursors-4u.net/nature/nat-2/nat120.cur",
  // trail: "/smoke.gif",
};

const INDEX_PAGE_SETTINGS: CssVariableSetting[] = [
  // {
  //   name: "header-background-image",
  //   type: "CssVariable",
  //   value: "url(/weed4.png)",
  // },
];

const BOARD_PAGE_SETTINGS: CssVariableSetting[] = [
  // {
  //   name: "feed-background-image",
  //   type: "CssVariable",
  //   value: "url(/weed4.png)",
  // },
];

const THREAD_PAGE_SETTINGS: CssVariableSetting[] = [
  // {
  //   name: "sidebar-background-image",
  //   type: "CssVariable",
  //   value: "url(/weed4.png)",
  // },
];
export const getSettingsBySlug = async ({
  userSettings,
  realmSlug,
}: {
  userSettings: SettingEntry[];
  realmSlug: string;
}) => {
  const baseSettings = {
    root: {},
    index_page: [] as CssVariableSetting[],
    board_page: [] as CssVariableSetting[],
    thread_page: [] as CssVariableSetting[],
  };
  // TODO: make a type of base settings so cursor is a known property.
  // @ts-expect-error
  baseSettings.root.cursor = getRealmCursorSetting(
    CURSOR_SETTINGS,
    userSettings
  );
  baseSettings.index_page = filterOutDisabledSettings(
    INDEX_PAGE_SETTINGS,
    userSettings
  );
  baseSettings.board_page = filterOutDisabledSettings(
    BOARD_PAGE_SETTINGS,
    userSettings
  );
  baseSettings.thread_page = filterOutDisabledSettings(
    THREAD_PAGE_SETTINGS,
    userSettings
  );
  return baseSettings;
};

export const getRealmDataBySlug = async ({
  realmSlug,
}: {
  realmSlug: string;
}): Promise<{
  id: string;
  string_id: string;
  slug: string;
} | null> => {
  return await pool.oneOrNone(sql.getRealmBySlug, {
    realm_slug: realmSlug,
  });
};

// I added this before realizing I didn't actually need it for what I was doing
// I can leave it in if it will be helpful in future, or I can delete it?
export const getRealmByUuid = async ({
  realmId,
}: {
  realmId: string;
}): Promise<{
  id: string;
  string_id: string;
  slug: string;
} | null> => {
  return await pool.oneOrNone(sql.getRealmByUuid, {
    realm_id: realmId,
  });
};

export const getUserPermissionsForRealm = async ({
  firebaseId,
  realmId,
}: {
  firebaseId: string;
  realmId: string;
}) => {
  try {
    const userPermissionsGroupedByRoles = await pool.manyOrNone(
      sql.getUserPermissionsForRealm,
      {
        user_id: firebaseId,
        realm_id: realmId,
      }
    );
    if (!userPermissionsGroupedByRoles.length) {
      return;
    }
    const userRealmPermissionsGroupedByRoles =
      userPermissionsGroupedByRoles.map((row) => {
        return extractRealmPermissions(
          row.permissions.substring(1, row.permissions.length - 1).split(/,/)
        );
      });
    const allUserRealmPermissions = userRealmPermissionsGroupedByRoles.reduce(
      (userRealmPermissions, userRealmPermissionsGroup) => {
        return userRealmPermissions.concat(userRealmPermissionsGroup);
      },
      []
    );
    return allUserRealmPermissions;
  } catch (e) {
    error(`Error while getting user permissions for the realm.`);
    error(e);
    return false;
  }
};

export const createInvite = async (inviteData: {
  email: string;
  inviteCode: string;
  inviterId: number;
}) => {
  const query = `
    INSERT INTO account_invites(nonce, inviter, invitee_email, duration)
    VALUES (
      $/invite_code/,
      $/inviter_id/,
      $/email/,
      INTERVAL '1 WEEK')`;
  try {
    await pool.none(query, {
      invite_code: inviteData.inviteCode,
      inviter_id: inviteData.inviterId,
      email: inviteData.email,
    });
    log(`Generated invite for email ${inviteData.email}.`);
    return true;
  } catch (e) {
    error(`Error while generating invite.`);
    error(e);
    return false;
  }
};

export const getInviteDetails = async ({
  nonce,
}: {
  nonce: string;
}): Promise<{
  email: string;
  used: boolean;
  expired: boolean;
  inviter: number;
} | null> => {
  try {
    const inviteDetails = await pool.one(sql.getInviteDetails, {
      nonce,
    });
    log(`Fetched details for invite ${nonce}:`);
    log(inviteDetails);
    return {
      email: inviteDetails.invitee_email,
      expired: inviteDetails.expired,
      used: inviteDetails.used,
      inviter: inviteDetails.inviter,
    };
  } catch (e) {
    error(`Error while getting invite details.`);
    error(e);
    return null;
  }
};

export const markInviteUsed = async ({
  nonce,
}: {
  nonce: string;
}): Promise<boolean> => {
  const query = `
    UPDATE account_invites
    SET used = TRUE
    WHERE nonce = $/nonce/`;
  try {
    await pool.none(query, {
      nonce,
    });
    log(`Marking invite ${nonce} as used.`);
    return true;
  } catch (e) {
    error(`Error while marking invite as used.`);
    error(e);
    return false;
  }
};

export const createNewUser = async (user: {
  firebaseId: string;
  invitedBy: number;
  createdOn: string;
}) => {
  const query = `
    INSERT INTO users(firebase_id, invited_by, created_on)
    VALUES ($/firebase_id/, $/invited_by/, $/created_on/)`;
  try {
    await pool.none(query, {
      firebase_id: user.firebaseId,
      invited_by: user.invitedBy,
      created_on: user.createdOn,
    });
    log(`Added new user in DB for firebase ID ${user.firebaseId}`);
    return true;
  } catch (e) {
    error(`Error creating a new user.`);
    error(e);
    return false;
  }
};
