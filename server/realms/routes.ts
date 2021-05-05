import debug from "debug";
import express from "express";
import { withUserSettings } from "../handlers/auth";
import {
  ensureNoIdentityLeakage,
  mergeObjectIdentity,
  transformImageUrls,
} from "../response-utils";
import firebaseAuth from "firebase-admin";
import { ServerThreadType, DbActivityThreadType } from "../../Types";
import { cache, CacheKeys } from "../cache";
import { aggregateByType, parseSettings } from "../utils/settings";
import { CssVariableSetting, GlobalSettings } from "../../types/settings";
import { filterOutDisabledSettings, getRealmCursorSetting } from "./utils";

const info = debug("bobaserver:users:routes-info");
const log = debug("bobaserver:users:routes-log");
const error = debug("bobaserver:users:routes-error");

const router = express.Router();

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

router.get("/:id", withUserSettings, async (req, res) => {
  try {
    const currentUserSettings = req.currentUser?.settings || [];
    const { id } = req.params;
    const baseSettings = {
      name: id,
      rootSettings: {},
      indexPageSettings: [] as CssVariableSetting[],
      boardPageSettings: [] as CssVariableSetting[],
      threadPageSettings: [] as CssVariableSetting[],
    };
    // @ts-expect-error
    baseSettings.rootSettings.cursor = getRealmCursorSetting(
      CURSOR_SETTINGS,
      currentUserSettings
    );
    baseSettings.indexPageSettings = filterOutDisabledSettings(
      INDEX_PAGE_SETTINGS,
      currentUserSettings
    );
    baseSettings.boardPageSettings = filterOutDisabledSettings(
      BOARD_PAGE_SETTINGS,
      currentUserSettings
    );
    baseSettings.threadPageSettings = filterOutDisabledSettings(
      THREAD_PAGE_SETTINGS,
      currentUserSettings
    );
    res.status(200).json(baseSettings);
  } catch (e) {
    res.status(500).send("There was an error fetching realm data.");
  }
});

export default router;
