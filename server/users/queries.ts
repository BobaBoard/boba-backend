import { SettingEntry, SettingValueTypes } from "../../types/settings";
import { decodeCursor, encodeCursor } from "utils/queries-utils";
import firebaseAuth, { auth } from "firebase-admin";

import debug from "debug";
import { parseSettings } from "utils/settings";
import pool from "server/db-pool";
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
  const settings = await pool.manyOrNone(sql.getUserSettings, {
    firebase_id: firebaseId,
  });
  log(`Fetched settings for user ${firebaseId}:`);
  info(settings);
  return parseSettings(settings);
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

export const createFirebaseUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<auth.UserRecord | null> => {
  try {
    const newUser = await firebaseAuth.auth().createUser({
      email,
      password,
    });
    const uid = newUser.uid;
    log(`Created new firebase user with uid ${uid}`);
    return newUser;
  } catch (e) {
    error(`Error creating firebase user:`);
    error(e);
    return null;
  }
};

export const createNewUser = async ({
  email,
  password,
  invitedBy,
}: {
  email: string;
  password: string;
  invitedBy: number;
}): Promise<string | null> => {
  try {
    const newUser = await createFirebaseUser({
      email,
      password,
    });
    if (!newUser) {
      throw new Error("Failed to create firebase user");
    }

    const firebaseId = newUser.uid;
    const createdOn = newUser.metadata.creationTime;

    await pool.none(sql.createNewUser, {
      firebase_id: firebaseId,
      invited_by: invitedBy,
      created_on: createdOn,
    });
    log(`Added new user in DB for firebase ID ${firebaseId}`);
    return firebaseId;
  } catch (e) {
    error(`Error creating user:`);
    error(e);
    return null;
  }
};

export const getUserRealmRoles = async () => {

}

export const getUserRolesByBoard = async () => {
  
}