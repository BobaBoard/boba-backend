import { getRealmDataBySlug, getSettingsBySlug } from "./queries";

import { NotFound404Error } from "types/errors/api";
import debug from "debug";
import express from "express";
import { getBoards } from "../boards/queries";
import { processBoardsSummary } from "utils/response-utils";
import { processRealmActivity } from "./utils";
import { withUserSettings } from "handlers/auth";

const info = debug("bobaserver:users:routes-info");
const log = debug("bobaserver:users:routes-log");
const error = debug("bobaserver:users:routes-error");

const router = express.Router();

const FANDOM_CODERS_RULES_BLOCK = {
  id: "82824aa5-f0dc-46b7-ad7b-aefac7f637cc",
  type: "rules",
  index: 0,
  title: "The Fandom Coders Rules",
  rules: [
    {
      index: 2,
      title: "No language discoursing",
      description: "Anything above Assembly was a mistake.",
      pinned: true,
    },
    {
      index: 0,
      title: "Be nice to baby coders",
      description: "They're young and scared, but are doing their best.",
      pinned: true,
    },
    {
      index: 1,
      title: "No horny on main (boards)",
      description:
        "If you feel the need to thirst for a fictional character, the fandom category is your friend.",
      pinned: false,
    },
  ],
};

/**
 * @openapi
 * /realms/slug/{realm_slug}:
 *   get:
 *     summary: Fetches the top-level realm metadata by slug.
 *     operationId: getRealmsBySlug
 *     tags:
 *       - /realms/
 *     security:
 *       - {}
 *       - firebase: []
 *     parameters:
 *       - name: realm_slug
 *         in: path
 *         description: The slug of the realm.
 *         required: true
 *         schema:
 *           type: string
 *         examples:
 *           v0:
 *             summary: the v0 realm
 *             value: v0
 *     responses:
 *       200:
 *         description: The realm metadata.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Realm"
 *             examples:
 *               v0:
 *                 $ref: '#/components/examples/V0RealmResponse'
 *       404:
 *         description: The realm was not found.
 */
router.get("/slug/:realm_slug", withUserSettings, async (req, res) => {
  try {
    const currentUserSettings = req.currentUser?.settings || [];
    const { realm_slug } = req.params;
    const settings = await getSettingsBySlug({
      realmSlug: realm_slug,
      userSettings: currentUserSettings,
    });

    const realmData = await getRealmDataBySlug({ realmSlug: realm_slug });

    if (!realmData) {
      throw new NotFound404Error(`The realm ${realm_slug} was not found.`);
    }

    const boards = await getBoards({
      firebaseId: req.currentUser?.uid,
      realmId: realmData.string_id,
    });

    if (!boards) {
      res.status(500);
    }

    const realmBoards = processBoardsSummary({
      boards,
      isLoggedIn: !!req.currentUser?.uid,
    });
    res.status(200).json({
      slug: realm_slug,
      icon: "https://images-ext-1.discordapp.net/external/KLz7_JytTOB6vzGDmnAuXTgkDtWuUCluyB6VxiAL8FA/%3Fsize%3D1024/https/cdn.discordapp.com/icons/911351540504199168/d6f98ff59822c22b1ff650796c346166.png",
      settings,
      homepage: {
        blocks:
          realm_slug == "twisted-minds" ? [FANDOM_CODERS_RULES_BLOCK] : [],
      },
      boards: realmBoards,
    });
  } catch (e) {
    error(e);
    res.status(500).json({
      message: "There was an error fetching realm data.",
    });
  }
});

/**
 * @openapi
 * /realms/{realm_id}/activity:
 *   get:
 *     summary: Fetches latest activity summary for the realm.
 *     operationId: getRealmsActivityByUuid
 *     tags:
 *       - /realms/
 *     security:
 *       - {}
 *       - firebase: []
 *     parameters:
 *       - name: realm_id
 *         in: path
 *         description: The id of the realm.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: The realm activity summary.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RealmActivity"
 *       404:
 *         description: The realm was not found.
 */
router.get("/:realm_id/activity", async (req, res) => {
  try {
    const { realm_id } = req.params;

    // TODO[realms]: use a per-realm query here
    const boards = await getBoards({
      firebaseId: req.currentUser?.uid,
      realmId: realm_id,
    });

    if (!boards) {
      res.status(500);
    }

    const realmBoards = processRealmActivity({
      boards,
    });
    res.status(200).json({
      boards: realmBoards,
    });
  } catch (e) {
    error(e);
    res.status(500).json({
      message: "There was an error fetching realm data.",
    });
  }
});

export default router;
