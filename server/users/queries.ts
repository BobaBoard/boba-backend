import debug from "debug";
import pool from "../pool";

const log = debug("bobaserver:users:queries-log");
const error = debug("bobaserver:users:queries-error");

export const getUserFromFirebaseId = async ({
  firebaseId,
}: {
  firebaseId: string;
}): Promise<any> => {
  const query = "SELECT * FROM users WHERE firebase_id = $1 LIMIT 1";

  try {
    const { rows } = await pool.query(query, [firebaseId]);
    log(`Fetched user data: `, rows[0]);
    return rows[0];
  } catch (e) {
    error(`Error while fetching users.`);
    error(e);
    return null;
  }
};
