import debug from "debug";
import express from "express";
import { withUserSettings } from "../../handlers/auth";
import { getSettingsBySlug } from "./queries";

const info = debug("bobaserver:users:routes-info");
const log = debug("bobaserver:users:routes-log");
const error = debug("bobaserver:users:routes-error");

const router = express.Router();

/**
 * @openapi
 * realms/slug/{realm_slug}/:
 *   get:
 *     summary: Fetches the top-level realm metadata by slug.
 *     tags:
 *       - /realms/
 *     security:
 *       - []
 *       - firebase: []
 *     parameters:
 *       - name: realm_slug
 *         in: path
 *         description: The slug of the realm.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The realm metadata. If authenticated, the settings object will respect the settings of the user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Realm"
 */
router.get("/slug/:realm_slug", withUserSettings, async (req, res) => {
  try {
    const currentUserSettings = req.currentUser?.settings || [];
    const { realm_slug } = req.params;
    const settings = await getSettingsBySlug({
      realmSlug: realm_slug,
      userSettings: currentUserSettings,
    });
    res.status(200).json({
      slug: realm_slug,
      settings,
    });
  } catch (e) {
    error(e);
    res.status(500).json({
      message: "There was an error fetching realm data.",
    });
  }
});

export default router;
