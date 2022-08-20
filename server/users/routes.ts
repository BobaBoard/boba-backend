import { BadRequest400Error, Internal500Error } from "types/errors/api";
import { CacheKeys, cache } from "../cache";
import { ensureLoggedIn, withUserSettings } from "handlers/auth";
import {
  getBobadexIdentities,
  getUserFromFirebaseId,
  getUserSettings,
  updateUserData,
  updateUserSettings,
} from "./queries";
import { processBoardsSummary, transformImageUrls } from "utils/response-utils";

import { RealmPermissions } from "types/permissions";
import { aggregateByType } from "utils/settings";
import debug from "debug";
import express from "express";
import { getBoards } from "../boards/queries";
import stringify from "fast-json-stable-stringify";
import { withRealmPermissions } from "handlers/permissions";

const info = debug("bobaserver:users:routes-info");
const log = debug("bobaserver:users:routes-log");
const error = debug("bobaserver:users:routes-error");

const router = express.Router();

/**
 * @openapi
 * /users/@me/{realm_id}:
 *   get:
 *     summary: Gets data for the current user.
 *     operationId: getCurrentUser
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
 *         examples:
 *           twisted_minds:
 *             summary: the twisted-minds realm id
 *             value: 76ef4cc3-1603-4278-95d7-99c59f481d2e
 *     responses:
 *       401:
 *         description: User was not found in request that requires authentication.
 *       403:
 *         description: User is not authorized to perform the action.
 *       200:
 *         description: The user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 avatar_url:
 *                   type: string
 *                   format: uri
 *                 pinned_boards:
 *                   description: |
 *                     A map from board id to its LoggedInSummary for each pinned board.
 *                   type: object
 *                   additionalProperties:
 *                     allOf:
 *                       - $ref: "#/components/schemas/LoggedInBoardSummary"
 *                       - type: object
 *                         properties:
 *                           index:
 *                             type: number
 *                         required:
 *                           - index
 *               required:
 *                 - pinned_boards
 */
router.get(
  "/@me/:realm_id",
  ensureLoggedIn,
  withRealmPermissions,
  async (req, res) => {
    let currentUserId: string = req.currentUser?.uid;
    const cachedData = await cache().hget(CacheKeys.USER, currentUserId);

    if (cachedData) {
      log(`Returning cached data for user ${currentUserId}`);
      return res.status(200).json(JSON.parse(cachedData));
    }

    log(`Fetching user data for firebase id: ${currentUserId}`);
    const userData = transformImageUrls(
      await getUserFromFirebaseId({
        firebaseId: currentUserId,
      })
    );
    info(`Found user data : `, userData);

    const boards = await getBoards({
      firebaseId: req.currentUser?.uid,
      realmId: req.currentRealmIds?.string_id,
    });

    if (!boards) {
      res.status(500);
    }

    const summaries = processBoardsSummary({
      boards,
      isLoggedIn: !!req.currentUser?.uid,
      hasRealmMemberAccess: req.currentRealmPermissions.includes(
        RealmPermissions.accessMemberOnlyContentOnRealm
      ),
    });
    const pins = summaries
      .filter((board: any) => board.pinned)
      .reduce((result: any, current: any) => {
        result[current.slug] = {
          ...current,
          index: boards.find(({ slug }: any) => current.slug == slug)
            .pinned_order,
        };
        return result;
      }, {});

    const userDataResponse = {
      username: userData.username,
      avatar_url: userData.avatarUrl,
      pinned_boards: pins,
    };
    res.status(200).json(userDataResponse);
    cache().hset(CacheKeys.USER, currentUserId, stringify(userDataResponse));
  }
);

/**
 * @openapi
 * /users/@me:
 *   patch:
 *     summary: Update data for the current user.
 *     operationId: updateCurrentUser
 *     tags:
 *       - /users/
 *     security:
 *       - firebase: []
 *     requestBody:
 *       description: request body
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 description: The username of the user.
 *                 type: string
 *               avatarUrl:
 *                 description: The avatar url of the user.
 *                 type: string
 *                 format: uri
 *             required:
 *               - username
 *               - avatarUrl
 *     responses:
 *       401:
 *         description: User was not found in request that requires authentication.
 *       403:
 *         description: User is not authorized to perform the action.
 *       200:
 *         description: The user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 avatar_url:
 *                   type: string
 *                   format: uri
 *               required:
 *                 - username
 *                 - avatar_url
 */
router.patch("/@me", ensureLoggedIn, async (req, res) => {
  let currentUserId: string = req.currentUser.uid;
  const { username, avatarUrl } = req.body;

  if (!username || !avatarUrl) {
    throw new BadRequest400Error(`Missing username or avatar url`);
  }
  log(`Updating user data for firebase id: ${currentUserId}`);

  const userData = await updateUserData({
    firebaseId: currentUserId,
    username,
    avatarUrl,
  });
  info(`Updated user data : `, userData);

  if (!userData) {
    res.sendStatus(500);
    return;
  }

  await cache().hdel(CacheKeys.USER, currentUserId);
  res.status(200).json({
    username: userData.username,
    avatar_url: userData.avatarUrl,
  });
});

/**
 * @openapi
 * /users/@me/bobadex:
 *   get:
 *     summary: Gets bobadex data for the current user.
 *     operationId: getCurrentUserBobadex
 *     tags:
 *       - /users/
 *     security:
 *       - firebase: []
 *     responses:
 *       401:
 *         description: User was not found in request that requires authentication.
 *       200:
 *         description: The bobadex data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BobaDex"
 *             examples:
 *               existing:
 *                 $ref: '#/components/examples/BobaDexResponse'
 */
router.get("/@me/bobadex", ensureLoggedIn, async (req, res) => {
  let currentUserId: string = req.currentUser.uid;
  const identities = await getBobadexIdentities({ firebaseId: currentUserId });
  res.status(200).json(identities);
});

/**
 * @openapi
 * /users/@me/settings:
 *   get:
 *     summary: Gets settings data for the current user.
 *     operationId: getUserSettings
 *     tags:
 *       - /users/
 *     security:
 *       - firebase: []
 *     responses:
 *       401:
 *         description: User was not found in request that requires authentication.
 *       200:
 *         description: The user settings data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserSettings"
 *             examples:
 *               existing:
 *                 $ref: '#/components/examples/UserSettingsResponse'
 */
router.get(
  "/@me/settings",
  ensureLoggedIn,
  withUserSettings,
  async (req, res) => {
    try {
      res.status(200).json(aggregateByType(req.currentUser.settings));
    } catch (e) {
      throw new Internal500Error(`Failed to get user settings`);
    }
  }
);

/**
 * @openapi
 * /users/@me/settings:
 *   patch:
 *     summary: Gets settings data for the current user.
 *     operationId: updateUserSettings
 *     tags:
 *       - /users/
 *     security:
 *       - firebase: []
 *     requestBody:
 *       description: request body
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               value:
 *                 oneOf:
 *                   - type: string
 *                   - type: boolean
 *             required:
 *              - name
 *              - value
 *           examples:
 *             settings_update:
 *               $ref: "#/components/examples/UserSettingsRequest"
 *     responses:
 *       401:
 *         description: User was not found in request that requires authentication.
 *       200:
 *         description: The updated user settings data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserSettings"
 *             examples:
 *               settings_update:
 *                 $ref: '#/components/examples/UserSettingsResponse'
 */
router.patch("/@me/settings", ensureLoggedIn, async (req, res) => {
  const { name, value } = req.body;

  const firebaseId = req.currentUser.uid;
  try {
    await updateUserSettings({
      firebaseId,
      settingName: name,
      settingValue: value,
    });

    const settings = await getUserSettings({ firebaseId });
    await cache().hset(
      CacheKeys.USER_SETTINGS,
      firebaseId,
      stringify(settings)
    );
    res.status(200).json(aggregateByType(settings));
  } catch (e) {
    throw new Internal500Error(`Failed to update user settings`);
  }
});

export default router;
