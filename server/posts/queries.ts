import debug from "debug";
import pool from "../pool";
import { v4 as uuidv4 } from "uuid";

const log = debug("bobaserver:threads:queries-log");
const error = debug("bobaserver:threads:queries-error");

export const postNewContribution = async ({
  userId,
  replyTo,
  content,
  anonymityType,
}: {
  userId: number;
  replyTo: string;
  content: string;
  anonymityType: string;
}): Promise<any> => {
  const query = `
      INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type)
      VALUES(
        $1,
        (SELECT id FROM posts WHERE posts.string_id = $2),
        (SELECT parent_thread FROM posts WHERE posts.string_id = $2),
        $3,
        $4,
        'text',
        NULL,
        $5
      ) RETURNING *`;

  try {
    const { rows } = await pool.query(query, [
      uuidv4(),
      replyTo,
      userId,
      content,
      anonymityType,
    ]);

    log(`Post insertion successful. Result: `, rows[0]);

    return rows[0];
  } catch (e) {
    error(`Error while fetching boards.`);
    error(e);
    return null;
  }
};
