import {
  DbRolePermissions,
  REALM_MEMBER_PERMISSIONS,
  RealmPermissions,
} from "types/permissions";
import {
  Realm,
  RulesBlock,
  SubscriptionBlock,
  UiBlocks,
} from "../../types/rest/realms";
import { filterOutDisabledSettings, getRealmCursorSetting } from "./utils";

import { CssVariableSetting } from "../../types/settings";
import { GetRealmBySlugDbSchema } from "./sql/types";
import { ITask } from "pg-promise";
import { SettingEntry } from "../../types/settings";
import debug from "debug";
import { extractRealmPermissions } from "utils/permissions-utils";
import pool from "server/db-pool";
import sql from "./sql";
import { v4 as uuidv4 } from "uuid";

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
  const realmDbData = GetRealmBySlugDbSchema.parse(
    await pool.oneOrNone(sql.getRealmBySlug, {
      realm_slug: realmSlug,
    })
  );

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
  realmExternalId,
}: {
  firebaseId: string;
  realmExternalId?: string;
}): Promise<any> => {
  try {
    await pool.none(sql.dismissNotifications, {
      firebase_id: firebaseId,
      realm_id: realmExternalId,
    });
    info(`Dismissed all notifications for user with firebaseId: `, firebaseId);
    return true;
  } catch (e) {
    error(`Error while dismissing notifications. `);
    error(e);
    return false;
  }
};

export const getRealmByExternalId = async ({
  realmExternalId,
}: {
  realmExternalId: string;
}): Promise<{
  id: string;
  string_id: string;
  slug: string;
} | null> => {
  return await pool.oneOrNone(sql.getRealmByExternalId, {
    realm_id: realmExternalId,
  });
};

export const getUserPermissionsForRealm = async ({
  firebaseId,
  realmExternalId,
}: {
  firebaseId: string | undefined;
  realmExternalId: string;
}) => {
  try {
    if (!firebaseId) {
      return [];
    }
    const userPermissionsGroupedByRole = await pool.manyOrNone(
      sql.getUserPermissionsForRealm,
      {
        user_id: firebaseId,
        realm_external_id: realmExternalId,
      }
    );
    const realmMember = await checkUserOnRealm({ firebaseId, realmExternalId });
    log("realmMember", realmMember);
    if (!userPermissionsGroupedByRole.length) {
      if (realmMember) {
        log("returning realm member permissions");
        return [...REALM_MEMBER_PERMISSIONS];
      }
      log("returning empty realm permissions");
      return [];
    }
    const allUserRolePermissions = userPermissionsGroupedByRole.reduce(
      (userRolePermissions, userRolePermissionsGroup) => {
        return userRolePermissions.concat(userRolePermissionsGroup.permissions);
      },
      []
    );
    if (allUserRolePermissions.includes(DbRolePermissions.all)) {
      log("user has all permissions");
      return [...REALM_MEMBER_PERMISSIONS, RealmPermissions.createRealmInvite];
    }
    const userRoleRealmPermissions = extractRealmPermissions(
      allUserRolePermissions
    );
    if (realmMember) {
      return [...userRoleRealmPermissions, ...REALM_MEMBER_PERMISSIONS];
    }
    return userRoleRealmPermissions;
  } catch (e) {
    error(`Error while getting user permissions for the realm.`);
    error(e);
    return null;
  }
};

export const createInvite = async (inviteData: {
  realmExternalId: string;
  email: string | null;
  inviteCode: string;
  inviterId: number;
  label: string | null;
}) => {
  try {
    await pool.none(sql.createRealmInvite, {
      realm_id: inviteData.realmExternalId,
      invite_code: inviteData.inviteCode,
      inviter_id: inviteData.inviterId,
      email: inviteData.email,
      label: inviteData.label,
    });
    log(`Generated invite for realm ${inviteData.realmExternalId}.`);
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
  realmExternalId: string;
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
      realmExternalId: inviteDetails.realm_id,
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
    realmExternalId,
  }: {
    firebaseId: string;
    realmExternalId: string;
  }
): Promise<boolean> => {
  try {
    await transaction.none(sql.addUserToRealm, {
      firebase_id: firebaseId,
      realm_external_id: realmExternalId,
    });
    log(`Added user ${firebaseId} to realm ${realmExternalId}`);
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
  realmExternalId,
}: {
  nonce: string;
  firebaseId: string;
  realmExternalId: string;
}): Promise<boolean> => {
  return pool
    .tx("accept-invite", async (transaction) => {
      const used = await markInviteUsed(transaction, { nonce });
      if (!used) {
        throw new Error(`Failed to mark invite as used`);
      }
      const addedToRealm = await addUserToRealm(transaction, {
        firebaseId,
        realmExternalId,
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
  realmExternalId,
}: {
  realmExternalId: string;
}): Promise<
  | {
      nonce: string;
      invitee_email: string | null;
      created_at: string;
      expires_at: string;
      inviter_id: string;
      label: string | null;
    }[]
  | null
> => {
  try {
    const invites = await pool.manyOrNone(sql.getInvites, {
      realmExternalId,
    });
    log(`Fetched invites for realm ${realmExternalId}:`);
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
  realmExternalId,
}: {
  firebaseId: string;
  realmExternalId: string;
}): Promise<boolean | null> => {
  try {
    const inRealm = await pool.oneOrNone(sql.findUserOnRealm, {
      firebase_id: firebaseId,
      realm_external_id: realmExternalId,
    });
    return !!inRealm;
  } catch (e) {
    error(`Error while checking user on realm.`);
    error(e);
    return null;
  }
};

export const getRealmRoles = async ({
  realmExternalId,
}: {
  realmExternalId: string;
}): Promise<
  | {
      user_id: string;
      username: string;
      role_id: string;
      role_name: string;
      label: string | null;
    }[]
  | null
> => {
  const realmRoles = await pool.manyOrNone(sql.fetchRolesInRealm, {
    realm_external_id: realmExternalId,
  });
  return realmRoles;
};

export const createBoard = async (metadata: {
  slug: string;
  category_id: string;
  realm_id: string;
  tagline: string;
  avatar_url: string;
  settings: string;
}) => {
  const boardExternalId = uuidv4();

  await pool.one(sql.createBoard, {
    slug: metadata.slug,
    category_id: metadata.category_id,
    tagline: metadata.tagline,
    avatar_reference_id: metadata.avatar_url,
    settings: metadata.settings,
    string_id: boardExternalId,
    realm_id: metadata.realm_id,
  });

  return boardExternalId;
};
