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
                  ON secret_identities.id = uti.identity_id),
        thread_posts_updates AS
        (SELECT
                    threads.string_id as threads_string_id,
                    threads.id as threads_id,
                    last_visit_time,
                    MIN(posts.created) as first_post,
                    MAX(posts.created) as last_post,
                    COUNT(posts.id) as posts_amount,              
                    SUM(CASE WHEN last_visit_time IS NULL OR last_visit_time < posts.created THEN 1 ELSE 0 END) as new_posts_amount
                FROM boards 
                LEFT JOIN threads
                    ON boards.id = threads.parent_board
                LEFT JOIN posts
                  ON posts.parent_thread = threads.id
                LEFT JOIN user_thread_last_visits
                    ON threads.id = user_thread_last_visits.thread_id
                      AND user_thread_last_visits.user_id = $2
                WHERE boards.slug = $1
                GROUP BY
                  threads.id, boards.id, last_visit_time)
    SELECT
      first_post.string_id as post_id,
      threads_string_id as thread_id,
      user_id,
      username,
      user_avatar,
      secret_identity,
      secret_avatar,
      TO_CHAR(created, 'YYYY-MM-DD"T"HH24:MI:SS') as created,
      content,
      CAST(posts_amount AS INT),
      CAST(threads_amount.count AS int) as threads_amount,
      TO_CHAR(GREATEST(first_post, last_post, last_comments), 'YYYY-MM-DD"T"HH24:MI:SS') as last_activity,
      is_friend.friend,
      user_id = $2 as self,
      CAST(new_posts_amount AS int),
      CAST(new_comments_amount AS int),
      last_comments,
      last_visit_time IS NULL OR last_visit_time < first_post.created as is_new,
      CAST(comments_amount AS int)
    FROM
      thread_posts_updates
      LEFT JOIN 
        (SELECT
          thread_posts_updates.threads_id as thread_id,
          MAX(comments.created) as last_comments,
          COUNT(comments.id) as comments_amount,  
          SUM(CASE WHEN last_visit_time IS NULL OR last_visit_time < comments.created THEN 1 ELSE 0 END) as new_comments_amount
        FROM thread_posts_updates 
        INNER JOIN comments
          ON thread_posts_updates.threads_id = comments.parent_thread
        GROUP BY thread_posts_updates.threads_id
        ) as thread_comments_updates
      ON thread_posts_updates.threads_id = thread_comments_updates.thread_id
    LEFT JOIN posts as first_post
      ON thread_posts_updates.threads_id = first_post.parent_thread AND first_post.created = thread_posts_updates.first_post
    LEFT JOIN thread_identities
      ON thread_identities.user_id = first_post.author AND thread_identities.thread_id = first_post.parent_thread
    LEFT JOIN LATERAL (SELECT COUNT(*) as count FROM posts WHERE posts.parent_post = first_post.id) as threads_amount
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
    return false;
  }
};
