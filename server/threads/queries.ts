import debug from "debug";
import pool from "../pool";

const log = debug("bobaserver:board:queries-log");
const error = debug("bobaserver:board:queries-error");

export const getThreadByStringId = async (threadId: string): Promise<any> => {
  const query = `
    WITH
        thread_comments AS
            (SELECT parent_post, json_agg(row_to_json(comments)) as comments FROM comments GROUP BY parent_post),
        thread_posts AS
            (SELECT posts.*, thread_comments.comments FROM posts LEFT JOIN thread_comments ON posts.id = thread_comments.parent_post)
    SELECT 
        threads.*, 
        json_agg(row_to_json(thread_posts)) as posts
    FROM threads
    LEFT JOIN thread_posts
        ON threads.id = thread_posts.parent_thread
    WHERE threads.string_id = $1
    GROUP BY threads.id`;

  try {
    const { rows } = await pool.query(query, [threadId]);

    if (rows.length === 0) {
      log(`Thread not found: ${threadId}`);
      return null;
    }
    if (rows.length > 1) {
      // TODO: decide whether to throw
      error(
        `Error: found ${rows.length} thread while fetching thread by id (${threadId}).`
      );
    }

    return rows[0];
  } catch (e) {
    error(`Error while fetching boards.`);
    error(e);
    return null;
  }
};

export const getThreadIdentitiesByStringId = async (
  threadId: string
): Promise<any> => {
  // TODO: hide non-friend identities directly from the queries to avoid accidental leaks.
  const query = `
        SELECT
            user_id as id,
            username,
            users.avatar_reference_id as user_avatar_reference_id,
            display_name,
            secret_identities.avatar_reference_id as secret_identity_avatar_reference_id
        FROM user_thread_identities AS uti 
            LEFT JOIN users ON uti.user_id = users.id 
            LEFT JOIN secret_identities ON secret_identities.id = uti.identity_id 
            LEFT JOIN threads ON threads.id = uti.thread_id
        WHERE threads.string_id = $1`;

  try {
    const { rows } = await pool.query(query, [threadId]);

    log(rows);

    if (rows.length === 0) {
      log(`Thread not found: ${threadId}`);
      return null;
    }

    return rows;
  } catch (e) {
    error(`Error while fetching boards.`);
    error(e);
    return null;
  }
};
