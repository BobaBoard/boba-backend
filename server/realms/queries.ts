import { filterOutDisabledSettings, getRealmCursorSetting } from "./utils";

import { CssVariableSetting } from "../../types/settings";
import { Realm } from "../../types/rest/realms";
import { SettingEntry } from "../../types/settings";
import debug from "debug";
import pool from "server/db-pool";
import sql from "./sql";

const log = debug("bobaserver:users:queries-log");
const error = debug("bobaserver:users:queries-error");
const info = debug("bobaserver:users:queries-info");

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
}): Promise<Omit<Realm, "boards"> | null> => {
  const realmDbData = await pool.oneOrNone(sql.getRealmBySlug, {
    realm_slug: realmSlug,
  });

  return {
    id: realmDbData.realm_id,
    slug: realmDbData.realm_slug,
    homepage: {
      blocks: realmDbData.homepage_blocks.map((block: any) => ({
        id: block.string_id,
        type: block.type,
        title: block.title,
        index: block.index,
        rules: block.rules.map((rule: any) => ({
          title: rule.title,
          description: rule.description,
          pinned: rule.pinned,
          index: rule.index,
        })),
      })),
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

export const getBobadexIdentities = async ({
  firebaseId,
  realmId,
}: {
  firebaseId: string;
  realmId: string;
}) => {
  try {
    log(`Getting boba identities firebase ID ${firebaseId}`);
    return {
      seasons: await pool.many(sql.getBobadexIdentities, {
        firebase_id: firebaseId,
        realm_id: realmId,
      }),
    };
  } catch (e) {
    error(`Error getting boba identities.`);
    error(e);
    return false;
  }
};

