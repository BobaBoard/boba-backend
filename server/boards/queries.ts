import debug from "debug";
import pool from "../pool";

const log = debug("bobaserver:board:queries-log");
const error = debug("bobaserver:board:queries-error");

export const getBoards = async (): Promise<any> => {
  const query = `
    SELECT 
        boards.slug,
        boards.tagline,
        boards.avatar_reference_id,
        boards.settings,
        COUNT(threads.id) as threads_count
    FROM boards
    LEFT JOIN threads ON boards.id = threads.parent_board
    GROUP BY boards.id`;

  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (e) {
    error(`Error while fetching boards.`);
    error(e);
    return null;
  }
};

export const getBoardBySlug = async (slug: string): Promise<any> => {
  const query = `
    SELECT 
        boards.slug,
        boards.tagline,
        boards.avatar_reference_id,
        boards.settings,
        COUNT(threads.id) as threads_count
    FROM boards
    LEFT JOIN threads ON boards.id = threads.parent_board
    WHERE boards.slug=$1
    GROUP BY boards.id`;

  try {
    const { rows } = await pool.query(query, [slug]);

    if (rows.length === 0) {
      log(`Board not found: ${slug}`);
      return null;
    }
    if (rows.length > 1) {
      // TODO: decide whether to throw
      error(
        `Error: found ${rows.length} boards while fetching board by slug (${slug}).`
      );
    }

    log(`Got getBoardBySlug query result %O`, rows[0]);
    return rows[0];
  } catch (e) {
    error(`Error while fetching board by slug (${slug}).`);
    error(e);
    return null;
  }
};

export const getBoardActivityBySlug = async ({
  slug,
  firebaseId,
}: {
  slug: string;
  firebaseId: string;
}): Promise<any> => {
  let userId;
  if (firebaseId) {
    const userQuery = "SELECT id FROM users WHERE firebase_id = $1 LIMIT 1";
    const userRes = await pool.query(userQuery, [firebaseId]);
    userId = userId = userRes?.rows?.[0].id;
  }

  const query = `
    WITH 
        thread_identities AS
            (SELECT
              uti.thread_id as thread_id,
              uti.user_id as user_id,
              users.username as username,
              users.avatar_reference_id as user_avatar,
              secret_identities.display_name as secret_identity,
              secret_identities.avatar_reference_id as secret_avatar
             FROM user_thread_identities AS uti 
             INNER JOIN users 
                  ON uti.user_id = users.id 
             INNER JOIN secret_identities 
                  ON secret_identities.id = uti.identity_id)
    SELECT
      outer_posts.string_id as post_id,
      threads_string_id as thread_id,
      user_id,
      username,
      user_avatar,
      secret_identity,
      secret_avatar,
      TO_CHAR(created, 'YYYY-MM-DD"T"HH:MI:SS') as created,
      content,
      posts_amount,
      threads_amount.count as threads_amount,
      comments_amount.count as comments_amount,
      TO_CHAR(GREATEST(first_post, last_post), 'YYYY-MM-DD"T"HH:MI:SS') as last_activity,
      is_friend.friend,
      user_id = $2 as self
    FROM
      (SELECT
           threads.string_id as threads_string_id,
           threads.id as threads_id,
           MIN(posts.created) as first_post,
           MAX(posts.created) as last_post,
           MAX(comments.created) as last_comments,
           COUNT(DISTINCT posts.id) as posts_amount
       FROM boards 
       LEFT JOIN threads
           ON boards.id = threads.parent_board
       LEFT JOIN posts
          ON posts.parent_thread = threads.id
       LEFT JOIN comments
           ON comments.parent_thread = threads.id
       WHERE boards.slug = $1
       GROUP BY
         threads.id, boards.id) as thread_updates
    LEFT JOIN posts as outer_posts
      ON thread_updates.threads_id = outer_posts.parent_thread AND outer_posts.created = thread_updates.first_post
    LEFT JOIN thread_identities
      ON thread_identities.user_id = outer_posts.author AND thread_identities.thread_id = outer_posts.parent_thread
    LEFT JOIN LATERAL (SELECT COUNT(*) as count FROM posts WHERE posts.parent_post = outer_posts.id) as threads_amount
      ON true
    LEFT JOIN LATERAL (SELECT COUNT(*) as count FROM comments WHERE comments.parent_post = outer_posts.id) as comments_amount
        ON true
    LEFT JOIN LATERAL (SELECT true as friend FROM friends WHERE friends.user_id = $2 AND friends.friend_id = author limit 1) as is_friend 
        ON true
    ORDER BY last_activity DESC`;

  try {
    const { rows } = await pool.query(query, [slug, userId]);

    if (rows.length === 0) {
      log(`Board not found: ${slug}`);
      return null;
    }
    if (rows.length == 1 && rows[0].thread_id == null) {
      // Only one row with just the null thread)
      log(`Board empty: ${slug}`);
      return [];
    }

    const result = rows;
    log(`Got getBoardActivityBySlug query result`, result);
    return result;
  } catch (e) {
    error(`Error while fetching board by slug (${slug}).`);
    error(e);
    return null;
  }
};
