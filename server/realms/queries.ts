import { filterOutDisabledSettings, getRealmCursorSetting } from "./utils";

import { CssVariableSetting } from "../../types/settings";
import { Internal500Error } from "types/errors/api";
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

export const getRealmIdsByUuid = async ({
  realmId,
}: {
  realmId: string;
}): Promise<{
  id: string;
  string_id: string;
  slug: string;
} | null> => {
  return await pool.oneOrNone(sql.getRealmIdsByUuid, {
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
    const userPermissionsGroupedByRole = await pool.manyOrNone(
      sql.getUserPermissionsForRealm,
      {
        user_id: firebaseId,
        realm_id: realmId,
      }
    );
    if (!userPermissionsGroupedByRole.length) {
      return;
    }
    const userRealmPermissionsGroupedByRoles = userPermissionsGroupedByRole.map(
      (row) => {
        return extractRealmPermissions(row.permissions);
      }
    );
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
  realmId: string;
  email: string;
  inviteCode: string;
  inviterId: number;
  label: string | null;
}) => {
  try {
    await pool.none(sql.createRealmInvite, {
      realm_id: inviteData.realmId,
      invite_code: inviteData.inviteCode,
      inviter_id: inviteData.inviterId,
      email: inviteData.email,
      label: inviteData.label,
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
  realmId: string;
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
      realmId: inviteDetails.string_id,
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

export const addUserToRealm = async ({
  user,
  realmStringId,
}: {
  user: string;
  realmStringId: string;
}): Promise<boolean> => {
  try {
    await pool.none(sql.addUserToRealm, {
      firebase_id: user,
      realm_string_id: realmStringId,
    });
    log(`Added user ${user} to realm ${realmStringId}`);
    return true;
  } catch (e) {
    error(`Error creating a new user.`);
    error(e);
    return false;
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

export const acceptInvite = async (
  nonce: string,
  user: string,
  realmStringId: string
): Promise<boolean> => {
  try {
    log("starting transaction");
    await pool.none("BEGIN TRANSACTION;");
    const used = await markInviteUsed({ nonce });
    if (!used) {
      throw new Error(`Failed to mark invite as used`);
    }
    const addedToRealm = await addUserToRealm({ user, realmStringId });
    if (!addedToRealm) {
      throw new Error(`Failed to add user to realm`);
    }
    await pool.none("COMMIT;");
    log("completed transaction");
    return true;
  } catch (e) {
    await pool.none("ROLLBACK;");
    log("rolled back transaction");
    error(`Error while accepting invite`);
    error(e);
    return false;
  }
};

export const getRealmInvites = async ({
  realmStringId,
}: {
  realmStringId: string;
}): Promise<
  | {
      nonce: string;
      invitee_email: string;
      created: string;
      expires_at: string;
      inviter_id: string;
      label: string | null;
    }[]
  | null
> => {
  try {
    const invites = await pool.manyOrNone(sql.getInvites, {
      realmStringId,
    });
    log(`Fetched invites for realm ${realmStringId}:`);
    log(invites);
    return invites;
  } catch (e) {
    error(`Error while getting invite details.`);
    error(e);
    return null;
  }
};

export const checkUserOnRealm = async ({
  user,
  realmStringId,
}: {
  user: string;
  realmStringId: string;
}): Promise<boolean | null> => {
  try {
    const inRealm = await pool.oneOrNone(sql.findUserOnRealm, {
      firebase_id: user,
      realm_string_id: realmStringId,
    });
    return inRealm ? true : false;
  } catch (e) {
    error(`Error while checking user on realm.`);
    error(e);
    return null;
  }
};
