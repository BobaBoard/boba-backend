import debug from "debug";
import pool from "../pool";
import { v4 as uuidv4 } from "uuid";

const log = debug("bobaserver:threads:queries-log");
const error = debug("bobaserver:threads:queries-error");

export const getThreadByStringId = async ({
  id,
  user,
}: {
  id: string;
  user?: string;
}): Promise<any> => {
  const query = `
    WITH
        thread_comments AS
            (SELECT 
              thread_comments.parent_post, 
              json_agg(json_build_object(
                'id', thread_comments.string_id,
                'parent_post', thread_comments.parent_thread_string_id,
                'author', thread_comments.author,
                'content', thread_comments.content,
                'created',  TO_CHAR(thread_comments.created, 'YYYY-MM-DD"T"HH24:MI:SS'),
                'anonymity_type', thread_comments.anonymity_type
              )) as comments 
              FROM (
                SELECT 
                  comments.*,
                  thread.string_id as parent_thread_string_id
                FROM comments 
                LEFT JOIN threads as thread
                  ON comments.parent_thread = thread.id
                WHERE thread.string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'
                ORDER BY comments.created ASC) as thread_comments
              GROUP BY thread_comments.parent_post),
        thread_posts AS
            (SELECT 
              posts.string_id as id,
              posts.parent_thread as parent_thread_id,
              parent.string_id as parent_post_id,
              posts.author,
              TO_CHAR(posts.created, 'YYYY-MM-DD"T"HH24:MI:SS') as created,
              posts.content,
              posts.type,
              posts.whisper_tags,
              posts.anonymity_type,
              thread_comments.comments 
             FROM posts
             LEFT JOIN posts as parent
              ON posts.parent_post = parent.id
             LEFT JOIN thread_comments 
              ON posts.id = thread_comments.parent_post
             ORDER BY posts.created DESC)
    SELECT 
        threads.string_id, 
        json_agg(row_to_json(thread_posts)) as posts
    FROM threads
    LEFT JOIN thread_posts
        ON threads.id = thread_posts.parent_thread_id
    WHERE threads.string_id = $1
    GROUP BY threads.id`;

  try {
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      log(`Thread not found: ${id}`);
      return null;
    }
    if (rows.length > 1) {
      // TODO: decide whether to throw
      error(
        `Error: found ${rows.length} thread while fetching thread by id (${id}).`
      );
    }

    return rows[0];
  } catch (e) {
    error(`Error while fetching threads.`);
    error(e);
    return null;
  }
};

export const getThreadIdentitiesByStringId = async ({
  id,
  user,
}: {
  id: string;
  user?: string;
}): Promise<any> => {
  let userRes;
  if (user) {
    const userQuery = "SELECT id FROM users WHERE firebase_id = $1 LIMIT 1";
    userRes = await pool.query(userQuery, [user]);
  }
  const query = `
        SELECT
            user_id as id,
            username,
            users.avatar_reference_id as user_avatar_reference_id,
            display_name,
            secret_identities.avatar_reference_id as secret_identity_avatar_reference_id,
            is_friend.friend,
            user_id = $1 as self
        FROM user_thread_identities AS uti 
            LEFT JOIN users ON uti.user_id = users.id 
            LEFT JOIN secret_identities ON secret_identities.id = uti.identity_id 
            LEFT JOIN threads ON threads.id = uti.thread_id
            LEFT JOIN LATERAL (SELECT true as friend FROM friends WHERE friends.user_id = $1 AND friends.friend_id = users.id limit 1) as is_friend ON 1=1 
        WHERE threads.string_id = $2`;

  try {
    const { rows } = await pool.query(query, [userRes?.rows?.[0].id, id]);

    log(rows);

    if (rows.length === 0) {
      log(`Thread not found: ${id}`);
      return null;
    }

    return rows;
  } catch (e) {
    error(`Error while fetching boards.`);
    error(e);
    return null;
  }
};

export const createThread = async ({
  userId,
  content,
  anonymityType,
  boardSlug,
}: {
  userId: string;
  content: string;
  anonymityType: string;
  boardSlug: string;
}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const userQuery = "SELECT id FROM users WHERE firebase_id = $1 LIMIT 1";
    const userRes = await client.query(userQuery, [userId]);
    const threadStringId = uuidv4();
    const createThread = `
      INSERT INTO threads(string_id, parent_board)
      VALUES (
        $1,
        (SELECT id FROM boards WHERE slug = $2))
      RETURNING id`;
    const threadResult = await client.query(createThread, [
      threadStringId,
      boardSlug,
    ]);

    const createPost = `
    INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, 
                      whisper_tags, anonymity_type)
    VALUES
      ($1,
       NULL,
       $2,
       $3,
       $4, 
       'text', 
       NULL, 
       $5)`;
    const creatPostResult = await client.query(createPost, [
      uuidv4(),
      threadResult.rows[0].id,
      userRes.rows[0].id,
      content,
      anonymityType,
    ]);

    const randomIdentity =
      "SELECT id FROM secret_identities ORDER BY RANDOM() LIMIT 1";
    const identityRes = await client.query(randomIdentity);

    const createIdentityResult = await client.query(
      `INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
       VALUES($1, $2, $3)`,
      [threadResult.rows[0].id, userRes.rows[0].id, identityRes.rows[0].id]
    );
    await client.query("COMMIT");
    return threadStringId;
  } catch (e) {
    await client.query("ROLLBACK");
    error(e);
    return null;
  } finally {
    client.release();
  }
};
