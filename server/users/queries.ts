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
