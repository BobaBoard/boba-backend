import {
  BadRequest400Error,
  Forbidden403Error,
  Internal500Error,
  NotFound404Error,
} from "types/errors/api";
import {
  acceptInvite,
  checkUserOnRealm,
  dismissAllNotifications,
  getInviteDetails,
  getRealmIdsByUuid,
  getRealmInvites,
  getUserPermissionsForRealm,
} from "server/realms/queries";
import { createNewUser, getUserFromFirebaseId } from "server/users/queries";
import { ensureLoggedIn, withLoggedIn, withUserSettings } from "handlers/auth";
import { ensureRealmExists, ensureRealmPermission } from "handlers/permissions";
import { getRealmDataBySlug, getSettingsBySlug } from "./queries";
import {
  processBoardsNotifications,
  processBoardsSummary,
} from "utils/response-utils";

import { RealmPermissions } from "types/permissions";
import { createInvite } from "server/realms/queries";
import debug from "debug";
import express from "express";
import firebaseAuth from "firebase-admin";
import { getBoards } from "../boards/queries";
import pool from "server/db-pool";
import { processRealmActivity } from "./utils";
import { randomBytes } from "crypto";

const info = debug("bobaserver:realms:routes-info");
const log = debug("bobaserver:realms:routes-log");
const error = debug("bobaserver:realms:routes-error");

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

    const realmPermissions = await getUserPermissionsForRealm({
      firebaseId: req.currentUser?.uid,
      realmStringId: realmData.id,
    });

    const boards = await getBoards({
      firebaseId: req.currentUser?.uid,
      realmId: realmData.id,
    });

    if (!boards) {
      res.status(500);
    }

    const realmBoards = processBoardsSummary({
      boards,
      isLoggedIn: !!req.currentUser?.uid,
    });
    res.status(200).json({
      id: realmData.id,
      slug: realm_slug,
      icon: realmData.icon,
      favicon: realmData.favicon,
      description: realmData.description,
      feedback_form_url: realmData.feedbackFormUrl,
      title: realmData.title,
      settings,
      homepage: realmData.homepage,
      realm_permissions: realmPermissions || [],
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
router.get("/:realm_id/activity", ensureRealmExists, async (req, res) => {
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

/**
 * @openapi
 * /realms/{realm_id}/notifications:
 *   get:
 *     summary: Gets notifications data for the current user.
 *     operationId: getCurrentUserNotifications
 *     description: |
 *       Gets notifications data for the current user, including pinned boards.
 *       If `realm_id` is present, also fetch notification data for the current realm.
 *     tags:
 *       - /users/
 *     security:
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
 *       401:
 *         description: User was not found in request that requires authentication.
 *       403:
 *         description: User is not authorized to perform the action.
 *       200:
 *         description: The notifications data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/NotificationsResponse"
 */
router.get("/:realm_id/notifications", ensureLoggedIn, async (req, res) => {
  const { realm_id } = req.params;

  const boards = await getBoards({
    firebaseId: req.currentUser?.uid,
    realmId: realm_id,
  });

  if (!boards) {
    res.status(500);
  }
  const notifications = processBoardsNotifications({
    boards,
  });
  const pinned = notifications
    .filter((notification: any) =>
      boards.find(
        (board: any) =>
          board.string_id == notification.id && board.pinned_order !== null
      )
    )
    .reduce((result: any, current: any) => {
      result[current.id] = {
        ...current,
      };
      return result;
    }, {});
  const realmBoards = notifications.reduce((result: any, current: any) => {
    result[current.id] = {
      ...current,
    };
    return result;
  }, {});

  const hasNotifications = notifications.some(
    (notification) => notification.has_updates
  );
  const isOutdatedNotifications = hasNotifications
    ? notifications.every(
        (notification) =>
          notification.has_updates === false || notification.is_outdated
      )
    : false;
  const notificationsDataResponse = {
    has_notifications: hasNotifications,
    is_outdated_notifications: isOutdatedNotifications,
    realm_id: realm_id,
    pinned_boards: pinned,
    realm_boards: realmBoards,
  };
  res.status(200).json(notificationsDataResponse);
});

/**
 * @openapi
 * /realms/{realm_id}/notifications:
 *   delete:
 *     summary: Dismisses user notifications.
 *     operationId: dismissUserNotifications
 *     tags:
 *       - /users/
 *     security:
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
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensureBoardAccess403"
 *       500:
 *         description: Internal Server Error
 *         $ref: "#/components/responses/default500"
 *       204:
 *         description: The notifications were successfully dismissed.
 */
router.delete("/:realm_id/notifications", ensureLoggedIn, async (req, res) => {
  let currentUserId: string = req.currentUser?.uid;
  log(`Dismissing notifications for firebase id: ${currentUserId}`);
  const { realm_id } = req.params;

  const dismissSuccessful = await dismissAllNotifications({
    firebaseId: currentUserId,
    realmId: realm_id,
  });

  if (!dismissSuccessful) {
    error(`Dismiss failed`);
    return res.sendStatus(500);
  }

  info(`Dismiss successful`);

  res.sendStatus(204);
});

/**
 * @openapi
 * /realms/{realm_id}/invites:
 *   get:
 *     summary: List all pending invites for the realm
 *     description: See https://github.com/essential-randomness/bobaserver/issues/56 for future design intentions to return all invites.
 *     operationId: getInvitesByRealmId
 *     tags:
 *       - /realms/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: realm_id
 *         in: path
 *         description: The id of the realm.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           twisted_minds:
 *             summary: the twisted-minds realm id
 *             value: 76ef4cc3-1603-4278-95d7-99c59f481d2e
 *     responses:
 *       200:
 *         description: The metadata of all pending invites for the current realm.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invites:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/InviteWithDetails"
 *             examples:
 *               twisted_minds:
 *                 value:
 *                   invites:
 *                     - realm_id: 76ef4cc3-1603-4278-95d7-99c59f481d2e
 *                       invite_url: https://twisted_minds.boba.social/invites/123invite_code456
 *                       invitee_email: ms.boba@bobaboard.com
 *                       own: false
 *                       issued_at: 2021-06-09T04:20:00Z
 *                       expires_at: 2021-06-09T16:20:00Z
 *                       label: This is a test invite.
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensurePermission403"
 *       404:
 *         description: The realm was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/genericResponse"
 */

router.get(
  "/:realm_id/invites",
  ensureLoggedIn,
  ensureRealmPermission(RealmPermissions.createRealmInvite),
  async (req, res) => {
    const realm = req.currentRealmIds;
    const userId = req.currentUser.uid;
    const unformattedInvites = await getRealmInvites({
      realmStringId: realm.string_id,
    });
    if (!unformattedInvites.length) {
      res.status(200).json({ invites: [] });
      return;
    }
    const formattedInvites = unformattedInvites.map((invite) => {
      const formattedInvite = {
        realm_id: realm.string_id,
        invite_url: `https://${realm.slug}.boba.social/invites/${invite.nonce}`,
        own: invite.inviter_id === userId ? true : false,
        issued_at: invite.created,
        expires_at: invite.expires_at,
        ...(invite.invitee_email && { invitee_email: invite.invitee_email }),
        ...(invite.label && { label: invite.label }),
      };
      return formattedInvite;
    });
    log(formattedInvites);
    res.status(200).json({ invites: formattedInvites || [] });
  }
);

/**
 * @openapi
 * /realms/{realm_id}/invites/{nonce}:
 *   get:
 *     summary: Get an invite's realm and status.
 *     operationId: getInviteByNonce
 *     tags:
 *       - /realms/
 *     parameters:
 *       - name: realm_id
 *         in: path
 *         description: The id of the realm.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           twisted_minds:
 *             summary: the twisted-minds realm id
 *             value: 76ef4cc3-1603-4278-95d7-99c59f481d2e
 *       - name: nonce
 *         in: path
 *         description: The invite code.
 *         required: true
 *         schema:
 *           type: string
 *         examples:
 *           twisted_minds:
 *             summary: the invite code.
 *             value: 123invite_code456
 *     responses:
 *       200:
 *         description: The realm amd status of the requested invite.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InviteStatus"
 *             examples:
 *               twisted_minds:
 *                 value:
 *                   realm_id: 76ef4cc3-1603-4278-95d7-99c59f481d2e
 *                   realm_slug: twisted-minds
 *                   invite_status: pending
 *                   requires_email: true
 *       404:
 *         description: The invite with the given code was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/genericResponse"
 */

router.get("/:realm_id/invites/:nonce", async (req, res) => {
  const nonce = req.params.nonce;
  const invite = await getInviteDetails({ nonce });
  if (!invite) {
    throw new NotFound404Error("The invite was not found");
  }
  const inviteRealm = await getRealmIdsByUuid({ realmId: invite.realmId });
  if (!inviteRealm) {
    throw new Internal500Error("failed to get realm ids");
  }
  res.status(200).json({
    realm_id: inviteRealm.string_id,
    realm_slug: inviteRealm.slug,
    invite_status: invite.expired
      ? "expired"
      : invite.used
      ? "used"
      : "pending",
    requires_email: !!invite.email,
  });
});

/**
 * @openapi
 * /realms/{realm_id}/invites:
 *   post:
 *     summary: Create invite for the realm.
 *     operationId: createInviteByRealmId
 *     tags:
 *       - /realms/
 *     security:
 *       - firebase: []
 *     parameters:
 *       - name: realm_id
 *         in: path
 *         description: The id of the realm.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           twisted_minds:
 *             summary: the twisted-minds realm id
 *             value: 76ef4cc3-1603-4278-95d7-99c59f481d2e
 *     requestBody:
 *       description: The invite data.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               label:
 *                 type: string
 *           examples:
 *             twisted_minds:
 *               value:
 *                 email: ms.boba@bobaboard.com
 *     responses:
 *       200:
 *         description: The invite metadata.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Invite"
 *             examples:
 *               twisted_minds:
 *                 value:
 *                   realm_id: 76ef4cc3-1603-4278-95d7-99c59f481d2e
 *                   invite_url: https://twisted_minds.boba.social/invites/123invite_code456
 *       401:
 *         $ref: "#/components/responses/ensureLoggedIn401"
 *       403:
 *         $ref: "#/components/responses/ensurePermission403"
 *       404:
 *         description: The realm was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/genericResponse"
 */
router.post(
  "/:realm_id/invites",
  ensureLoggedIn,
  ensureRealmPermission(RealmPermissions.createRealmInvite),
  async (req, res) => {
    const user = req.currentUser?.uid;
    const realmId = req.params.realm_id;
    const { email, label } = req.body;

    // Generate 64 characters random id string
    const inviteCode = randomBytes(32).toString("hex");
    const adminId = await getUserFromFirebaseId({ firebaseId: user });
    log(adminId);

    const inviteAdded = await createInvite({
      realmId,
      email,
      inviteCode,
      inviterId: adminId.id,
      label,
    });

    if (!inviteAdded) {
      res.status(500).send(`Couldn't generate invite for email ${email}`);
    }
    const realm = req.currentRealmIds;
    log(realm);

    res.status(200).json({
      realm_id: realmId,
      // TODO: we should probably just return the details here and let the client construct
      // the URL. If we don't do this, then we leak info that the client is in charge of
      // to the server.
      invite_url: `https://${realm.slug}.boba.social/invites/${inviteCode}`,
    });
  }
);

/**
 * @openapi
 * /realms/{realm_id}/invites/{nonce}:
 *   get:
 *     summary: Get an invite's realm and status.
 *     operationId: getInviteByNonce
 *     tags:
 *       - /realms/
 *     parameters:
 *       - name: realm_id
 *         in: path
 *         description: The id of the realm.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           twisted_minds:
 *             summary: the twisted-minds realm id
 *             value: 76ef4cc3-1603-4278-95d7-99c59f481d2e
 *       - name: nonce
 *         in: path
 *         description: The invite code.
 *         required: true
 *         schema:
 *           type: string
 *         examples:
 *           twisted_minds:
 *             summary: the invite code.
 *             value: 123invite_code456
 *     responses:
 *       200:
 *         description: The realm amd status of the requested invite.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InviteStatus"
 *             examples:
 *               twisted_minds:
 *                 value:
 *                   realm_id: 76ef4cc3-1603-4278-95d7-99c59f481d2e
 *                   realm_slug: twisted-minds
 *                   invite_status: pending
 *       404:
 *         description: The invite with the given code was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/genericResponse"
 */

router.get("/:realm_id/invites/:nonce", async (req, res) => {
  const nonce = req.params.nonce;
  const invite = await getInviteDetails({ nonce });
  if (!invite) {
    throw new NotFound404Error("The invite was not found");
  }
  const inviteRealm = await getRealmIdsByUuid({ realmId: invite.realmId });
  if (!inviteRealm) {
    throw new Internal500Error("failed to get realm ids");
  }
  res.status(200).json({
    realm_id: inviteRealm.string_id,
    realm_slug: inviteRealm.slug,
    invite_status: invite.expired
      ? "expired"
      : invite.used
      ? "used"
      : "pending",
  });
});

/**
 * @openapi
 * /realms/{realm_id}/invites/{nonce}:
 *   post:
 *     summary: Accept invite for the realm.
 *     operationId: acceptInviteByNonce
 *     tags:
 *       - /realms/
 *     security:
 *       - firebase: []
 *       # Currently does not require logged-in, update if we decide to separate out sign-up invites
 *       - {}
 *     parameters:
 *       - name: realm_id
 *         in: path
 *         description: The id of the realm.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         examples:
 *           twisted_minds:
 *             summary: the twisted-minds realm id
 *             value: 76ef4cc3-1603-4278-95d7-99c59f481d2e
 *       - name: nonce
 *         in: path
 *         description: The invite code.
 *         required: true
 *         schema:
 *           type: string
 *         examples:
 *           twisted_minds:
 *             summary: the invite code.
 *             value: 123invite_code456
 *     # Remove email and password requirements if we decide to separate out sign-up invites
 *     requestBody:
 *       description: The user data for the invite. Only required if the user does not already have an account.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *           examples:
 *             twisted_minds:
 *               value:
 *                 email: ms.boba@bobaboard.com
 *                 password: how_bad_can_i_be
 *     responses:
 *       200:
 *         description: The invite was successfully accepted.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AcceptedInviteResponse"
 *             examples:
 *               twisted_minds:
 *                 value:
 *                   realm_id: 76ef4cc3-1603-4278-95d7-99c59f481d2e
 *                   realm_slug: twisted-minds
 *       400:
 *         description: Request does not contain email and password require to create new user account.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/genericResponse"
 *       403:
 *         description: The invite is not valid anymore, or the user's email does not correspond to the invited one.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/genericResponse"
 *       404:
 *         description: The invite with the given code was not found, or the requested realm does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/genericResponse"
 *       409:
 *         description: The user is already a member of the requested realm.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/genericResponse"
 */

// TODO: decide if sign-up invites should be separated off from Realm invites.
router.post(
  "/:realm_id/invites/:nonce",
  withLoggedIn,
  ensureRealmExists,
  async (req, res) => {
    const { nonce } = req.params;
    const userId = req.currentUser?.uid;

    // If we decide to separate out sign-up invites, remove getting email and password from req body.
    const email = req.currentUser?.email || req.body.email;
    const { password } = req.body;

    const inviteDetails = await getInviteDetails({ nonce });

    if (!inviteDetails) {
      throw new NotFound404Error(`Invite not found`);
    }

    log("email:", email);
    if (!userId && (email?.length < 1 || password?.length < 1)) {
      throw new BadRequest400Error(
        `Email and password required to create new user account`
      );
    }

    if (inviteDetails.expired || inviteDetails.used) {
      throw new Forbidden403Error(`Invite expired or already used`);
    }
    if (inviteDetails.email?.length > 0) {
      if (
        inviteDetails.email.toLowerCase() != (email as string).toLowerCase()
      ) {
        throw new Forbidden403Error(`Invite email does not match`);
      }
    }

    const inviteRealm = await getRealmIdsByUuid({
      realmId: inviteDetails.realmId,
    });

    if (userId) {
      const alreadyOnRealm = await checkUserOnRealm({
        firebaseId: userId,
        realmStringId: inviteRealm.string_id,
      });
      if (alreadyOnRealm) {
        res
          .status(409)
          .send({ message: "User is already a member of the requested realm" });
        return;
      } else if (alreadyOnRealm !== false) {
        throw new Internal500Error(
          `Failed to check if user is already on realm`
        );
      }
    }

    // If we decide to separate out sign-up invites, move the call to createNewUser to the sign-up endpoint.
    // Then the firebaseId param for acceptInvite can just be userId.
    const firebaseId =
      userId ??
      (await createNewUser({
        email,
        password,
        invitedBy: inviteDetails.inviter,
      }));

    if (!firebaseId) {
      throw new Internal500Error(`Failed to find or create user`);
    }

    const accepted = await acceptInvite({
      nonce,
      firebaseId,
      realmStringId: inviteRealm.string_id,
    });
    if (!accepted) {
      throw new Internal500Error(`Failed to accept invite`);
    }
    res.status(200).json({
      realm_id: inviteRealm.string_id,
      realm_slug: inviteRealm.slug,
    });
  }
);

export default router;
