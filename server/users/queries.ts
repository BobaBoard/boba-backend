import { SettingEntry, SettingValueTypes } from "../../types/settings";
import { decodeCursor, encodeCursor } from "utils/queries-utils";

import { DbActivityThreadType } from "Types";
import debug from "debug";
import { parseSettings } from "utils/settings";
import pool from "../db-pool";
import sql from "./sql";

const log = debug("bobaserver:users:queries-log");
const error = debug("bobaserver:users:queries-error");
const info = debug("bobaserver:users:queries-info");

export const getUserFromFirebaseId = async ({
  firebaseId,
}: {
  firebaseId: string;
}): Promise<any> => {
  try {
    const user = await pool.one(sql.getUserDetails, {
      firebase_id: firebaseId,
    });
    info(`Fetched user data: `, user);
    return user;
  } catch (e) {
    error(`Error while fetching users.`);
    error(e);
    return null;
  }
};

export const dismissAllNotifications = async ({
  firebaseId,
}: {
  firebaseId: string;
}): Promise<any> => {
  try {
    await pool.none(sql.dismissNotifications, { firebase_id: firebaseId });
    info(`Dismissed all notifications for user with firebaseId: `, firebaseId);
    return true;
  } catch (e) {
    error(`Error while dismissing notifications.`);
    error(e);
    return false;
  }
};

export const updateUserData = async ({
  firebaseId,
  username,
  avatarUrl,
}: {
  firebaseId: string;
  username: string;
  avatarUrl: string;
}): Promise<{
  username: string;
  avatarUrl: string;
} | null> => {
  try {
    await pool.none(sql.updateUserData, {
      firebase_id: firebaseId,
      username,
      avatar_url: avatarUrl,
    });
    info(`Updated user data for user with firebaseId: `, firebaseId);
    return {
      username,
      avatarUrl,
    };
  } catch (e) {
    error(`Error while updating user data.`);
    error(e);
    return null;
  }
};

export const getUserSettings = async ({
  firebaseId,
}: {
  firebaseId: string;
}): Promise<SettingEntry[]> => {
  try {
    const settings = await pool.manyOrNone(sql.getUserSettings, {
      firebase_id: firebaseId,
    });
    log(`Fetched settings for user ${firebaseId}:`);
    info(settings);
    return parseSettings(settings);
  } catch (e) {
    error(`Error while getting user settings.`);
    error(e);
    return null;
  }
};

export const updateUserSettings = async ({
  firebaseId,
  settingName,
  settingValue,
}: {
  firebaseId: string;
  settingName: string;
  settingValue: string;
}): Promise<void> => {
  try {
    const type = await pool.one(sql.getSettingType, {
      setting_name: settingName,
    });

    switch (type) {
      case SettingValueTypes.BOOLEAN:
        log(typeof settingValue);
        if (typeof settingValue !== "boolean") {
          throw new Error(
            `Found invalid setting value for setting ${settingName} (${type}).`
          );
        }
    }
    await pool.none(sql.updateUserSettings, {
      firebase_id: firebaseId,
      setting_name: settingName,
      setting_value: settingValue,
    });
  } catch (e) {
    error(e);
    throw Error(`Error while getting user settings.`);
  }
};

export const getInviteDetails = async ({
  nonce,
}: {
  nonce: string;
}): Promise<{
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

export const createNewUser = async (user: {
  firebaseId: string;
  invitedBy: number;
  createdOn: string;
}) => {
  const query = `
    INSERT INTO users(firebase_id, invited_by, created_on)
    VALUES ($/firebase_id/, $/invited_by/, $/created_on/)`;
  try {
    await pool.none(query, {
      firebase_id: user.firebaseId,
      invited_by: user.invitedBy,
      created_on: user.createdOn,
    });
    log(`Added new user in DB for firebase ID ${user.firebaseId}`);
    return true;
  } catch (e) {
    error(`Error creating a new user.`);
    error(e);
    return false;
  }
};

export const getBobadexIdentities = async ({
  firebaseId,
}: {
  firebaseId: string;
}) => {
  try {
    log(`Getting boba identities firebase ID ${firebaseId}`);
    return {
      seasons: await pool.many(sql.getBobadexIdentities, {
        firebase_id: firebaseId,
      }),
    };
  } catch (e) {
    error(`Error getting boba identities.`);
    error(e);
    return false;
  }
};
