import debug from "debug";
import pool from "../pool";

const log = debug("bobaserver:users:queries-log");
const error = debug("bobaserver:users:queries-error");
const info = debug("bobaserver:users:queries-info");

export const getUserFromFirebaseId = async ({
  firebaseId,
}: {
  firebaseId: string;
}): Promise<any> => {
  const query = "SELECT * FROM users WHERE firebase_id = $1 LIMIT 1";

  try {
    const user = await pool.one(query, [firebaseId]);
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
  const dismissNotifications = `
    INSERT INTO dismiss_notifications_requests(user_id, dismiss_request_time) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
         DEFAULT)
    ON CONFLICT(user_id) DO UPDATE 
        SET dismiss_request_time = DEFAULT
        WHERE dismiss_notifications_requests.user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)`;

  try {
    await pool.none(dismissNotifications, { firebase_id: firebaseId });
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
  const updateUserDataQuery = `
    UPDATE users
    SET username = $/username/,
        avatar_reference_id = $/avatar_url/
    WHERE firebase_id = $/firebase_id/`;

  try {
    await pool.none(updateUserDataQuery, {
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
