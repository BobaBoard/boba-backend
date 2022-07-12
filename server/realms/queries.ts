import {
  Realm,
  RulesBlock,
  SubscriptionBlock,
  UiBlocks,
} from "../../types/rest/realms";
import { filterOutDisabledSettings, getRealmCursorSetting } from "./utils";

import { CssVariableSetting } from "../../types/settings";
import { ITask } from "pg-promise";
import { REALM_MEMBER_PERMISSIONS } from "types/permissions";
import { SettingEntry } from "../../types/settings";
import debug from "debug";
import { extractRealmPermissions } from "utils/permissions-utils";
import pool from "server/db-pool";
import sql from "./sql";

const info = debug("bobaserver:realms:queries-info");
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

const getBlocksData = (dbBlocks: any[]): UiBlocks[] => {
  return dbBlocks.map((dbBlock: { type: UiBlocks["type"] }) => {
    switch (dbBlock.type) {
      case "rules":
        return {
          id: (dbBlock as any).string_id as string,
          type: dbBlock.type,
          title: (dbBlock as any).title as string,
          index: (dbBlock as any).index as number,
          rules: (dbBlock as any).rules.map((rule: any) => ({
            title: rule.title as string,
            description: rule.description as string,
            pinned: rule.pinned as boolean,
            index: rule.index as number,
          })),
        } as RulesBlock;
      case "subscription":
        return {
          id: (dbBlock as any).string_id,
          type: (dbBlock as any).type,
          title: (dbBlock as any).title,
          index: (dbBlock as any).index,
          subscription_id: (dbBlock as any).subscription_id,
        } as SubscriptionBlock;
    }
  });
};

export const getRealmDataBySlug = async ({
  realmSlug,
}: {
  realmSlug: string;
}): Promise<Omit<Realm, "boards" | "permissions"> | null> => {
  const realmDbData = await pool.oneOrNone(sql.getRealmBySlug, {
    realm_slug: realmSlug,
  });

  return {
    id: realmDbData.realm_id,
    slug: realmDbData.realm_slug,
    icon: realmDbData.realm_icon_url,
    favicon: realmDbData.realm_favicon_url,
    title: realmDbData.realm_title,
    description: realmDbData.realm_description,
    feedbackFormUrl: realmDbData.realm_feedback_form_url,
    homepage: {
      blocks: getBlocksData(realmDbData.homepage_blocks),
    },
  };
};

export const dismissAllNotifications = async ({
  firebaseId,
  realmId,
}: {
  firebaseId: string;
  realmId?: string;
}): Promise<any> => {
  try {
    await pool.none(sql.dismissNotifications, {
      firebase_id: firebaseId,
      realm_id: realmId,
    });
    info(`Dismissed all notifications for user with firebaseId: `, firebaseId);
    return true;
  } catch (e) {
    error(`Error while dismissing notifications. `);
    error(e);
    return false;
  }
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
  realmStringId,
}: {
  firebaseId: string | undefined;
  realmStringId: string;
}) => {
  try {
    if (!firebaseId) {
      return null;
    }
    const userPermissionsGroupedByRole = await pool.manyOrNone(
      sql.getUserPermissionsForRealm,
      {
        user_id: firebaseId,
        realm_string_id: realmStringId,
      }
    );
    if (!userPermissionsGroupedByRole.length) {
      return null;
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
    const realmMember = checkUserOnRealm({ firebaseId, realmStringId });
    if (realmMember) {
      return [...allUserRealmPermissions, ...REALM_MEMBER_PERMISSIONS];
    }
    return allUserRealmPermissions;
  } catch (e) {
    error(`Error while getting user permissions for the realm.`);
    error(e);
    return null;
  }
};

export const createInvite = async (inviteData: {
  realmId: string;
  email: string | null;
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
    log(`Generated invite for realm ${inviteData.realmId}.`);
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
  email: string | null;
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
      realmId: inviteDetails.realm_id,
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

export const addUserToRealm = async (
  transaction: ITask<unknown>,
  {
    firebaseId,
    realmStringId,
  }: {
    firebaseId: string;
    realmStringId: string;
  }
): Promise<boolean> => {
  try {
    await transaction.none(sql.addUserToRealm, {
      firebase_id: firebaseId,
      realm_string_id: realmStringId,
    });
    log(`Added user ${firebaseId} to realm ${realmStringId}`);
    return true;
  } catch (e) {
    error(`Error adding user to realm.`);
    error(e);
    return false;
  }
};

export const markInviteUsed = async (
  transaction: ITask<unknown>,
  {
    nonce,
  }: {
    nonce: string;
  }
): Promise<boolean> => {
  const query = `
    UPDATE account_invites
    SET used = TRUE
    WHERE nonce = $/nonce/`;
  try {
    await transaction.none(query, {
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

export const acceptInvite = async ({
  nonce,
  firebaseId,
  realmStringId,
}: {
  nonce: string;
  firebaseId: string;
  realmStringId: string;
}): Promise<boolean> => {
  return pool
    .tx("accept-invite", async (transaction) => {
      const used = await markInviteUsed(transaction, { nonce });
      if (!used) {
        throw new Error(`Failed to mark invite as used`);
      }
      const addedToRealm = await addUserToRealm(transaction, {
        firebaseId,
        realmStringId,
      });
      if (!addedToRealm) {
        throw new Error(`Failed to add user to realm`);
      }
      return true;
    })
    .catch((e) => {
      error(`Error while accepting invite`);
      error(e);
      return false;
    });
};

export const getRealmInvites = async ({
  realmStringId,
}: {
  realmStringId: string;
}): Promise<
  | {
      nonce: string;
      invitee_email: string | null;
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
  firebaseId,
  realmStringId,
}: {
  firebaseId: string;
  realmStringId: string;
}): Promise<boolean | null> => {
  try {
    const inRealm = await pool.oneOrNone(sql.findUserOnRealm, {
      firebase_id: firebaseId,
      realm_string_id: realmStringId,
    });
    return !!inRealm;
  } catch (e) {
    error(`Error while checking user on realm.`);
    error(e);
    return null;
  }
};
