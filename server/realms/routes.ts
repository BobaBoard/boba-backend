import {
  BadRequest400Error,
  Forbidden403Error,
  Internal500Error,
  NotFound404Error,
} from "types/errors/api";
import { createNewUser, getUserFromFirebaseId } from "server/users/queries";
import { ensureLoggedIn, withUserSettings } from "handlers/auth";
import { getInviteDetails, markInviteUsed } from "server/realms/queries";
import { getRealmDataBySlug, getSettingsBySlug } from "./queries";

import { RealmPermissions } from "types/permissions";
import { createInvite } from "server/realms/queries";
import debug from "debug";
import { ensureRealmPermission } from "handlers/permissions";
import express from "express";
import firebaseAuth from "firebase-admin";
import { getBoards } from "../boards/queries";
import { processBoardsSummary } from "utils/response-utils";
import { processRealmActivity } from "./utils";
import { randomBytes } from "crypto";

const info = debug("bobaserver:users:routes-info");
const log = debug("bobaserver:users:routes-log");
const error = debug("bobaserver:users:routes-error");

const router = express.Router();

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
      settings,
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

router.post(
  "/:realm_id/invites",
  ensureLoggedIn,
  ensureRealmPermission(RealmPermissions.createInvite),
  async (req, res) => {
    const user = req.currentUser?.uid;
    // if (user !== ADMIN_ID) {
    //   return res.sendStatus(403);
    // }
    const { email } = req.body;
    // Generate 64 characters random id string
    const inviteCode = randomBytes(32).toString("hex");
    const adminId = await getUserFromFirebaseId({ firebaseId: user });

    log(adminId);
    const inviteAdded = await createInvite({
      email,
      inviteCode,
      inviterId: adminId.id,
    });

    if (!inviteAdded) {
      res.status(500).send(`Couldn't generate invite for email ${email}`);
    }
    res
      .status(200)
      .json({ inviteUrl: `https://v0.boba.social/invite/${inviteCode}` });
  }
);

router.post("/:realm_id/invites/:nonce", async (req, res) => {
  const { email, password } = req.body;
  const { nonce } = req.params;

  const inviteDetails = await getInviteDetails({ nonce });

  if (!inviteDetails) {
    throw new NotFound404Error(`Invite not found`);
  }

  if (inviteDetails.expired || inviteDetails.used) {
    throw new Forbidden403Error(`Invite expired or already used`);
  }

  if (inviteDetails.email.toLowerCase() != (email as string).toLowerCase()) {
    throw new Forbidden403Error(`Invite email does not match`);
  }
  firebaseAuth
    .auth()
    .createUser({
      email,
      password,
    })
    .then(async (user) => {
      const uid = user.uid;
      log(`Created new firebase user with uid ${uid}`);
      // TODO: decide whether to put these together in a transaction.
      const success = await markInviteUsed({ nonce });
      if (!success) {
        throw new Internal500Error(`Failed to mark invite as used`);
      }
      const created = await createNewUser({
        firebaseId: uid,
        invitedBy: inviteDetails.inviter,
        createdOn: user.metadata.creationTime,
      });
      if (!created) {
        throw new Internal500Error(`Failed to create new user`);
      }
      res.sendStatus(200);
    })
    .catch((error) => {
      throw new BadRequest400Error(
        `Error creating user: ${error.message} (${error.code})`
      );
    });
});

export default router;
