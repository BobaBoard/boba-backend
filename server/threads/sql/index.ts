import { QueryFile } from "pg-promise";
import path from "path";

const createThread = `
    INSERT INTO threads(string_id, parent_board)
    VALUES (
      $/thread_string_id/,
      (SELECT id FROM boards WHERE slug = $/board_slug/))
    RETURNING id`;

const createPost = `
    INSERT INTO posts(
      string_id, parent_post, parent_thread, 
      author, 
      content, type, 
      whisper_tags, 
      anonymity_type, options)
    VALUES
      ($/post_string_id/, NULL, $/parent_thread/,
       (SELECT id FROM users WHERE firebase_id = $/firebase_id/),
      $/content/, 'text', 
      $/whisper_tags/, 
      $/anonymity_type/,
      $/options/) 
    RETURNING id`;

const getRandomIdentityId = `
    SELECT id FROM secret_identities ORDER BY RANDOM() LIMIT 1`;

/**
 * Returns role data given the string id iff such a role is present for the given board & user.
 */
const getRoleByStringId = `
    SELECT 
      roles.id,
      roles.name,
      roles.avatar_reference_id,
      to_json(roles.permissions) as permissions
    FROM roles
    LEFT JOIN board_user_roles bur
      ON roles.id = bur.role_id
    INNER JOIN users 
      ON users.id = bur.user_id 
    WHERE
      roles.string_id = $/role_id/
      AND bur.board_id  = (SELECT id FROM boards WHERE boards.slug = $/board_slug/)
      AND bur.user_id  = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)`;

const insertNewIdentity = `
    INSERT INTO user_thread_identities(thread_id, user_id, identity_id, role_id)
    VALUES(
      $/thread_id/,
      (SELECT id FROM users WHERE firebase_id = $/firebase_id/),
      $/secret_identity_id/,
      $/role_id/)`;

const muteThreadByStringId = `
    INSERT INTO user_muted_threads(user_id, thread_id) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
        (SELECT id from threads WHERE threads.string_id = $/thread_string_id/))
    ON CONFLICT(user_id, thread_id) DO NOTHING`;

const unmuteThreadByStringId = `
    DELETE FROM user_muted_threads WHERE
        user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
        AND
        thread_id = (SELECT id from threads WHERE threads.string_id = $/thread_string_id/)`;

const hideThreadByStringId = `
    INSERT INTO user_hidden_threads(user_id, thread_id) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
        (SELECT id from threads WHERE threads.string_id = $/thread_string_id/))
    ON CONFLICT(user_id, thread_id) DO NOTHING`;

const unhideThreadByStringId = `
    DELETE FROM user_hidden_threads WHERE
        user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
        AND
        thread_id = (SELECT id from threads WHERE threads.string_id = $/thread_string_id/)`;

export default {
  threadIdByString: new QueryFile(
    path.join(__dirname, "thread-by-string-id.sql")
  ),
  threadIdentitiesByStringId: new QueryFile(
    path.join(__dirname, "thread-identities-by-string-id.sql")
  ),
  visitThreadByStringId: new QueryFile(
    path.join(__dirname, "visit-thread-by-string-id.sql")
  ),
  createThread,
  createPost,
  getRandomIdentityId,
  insertNewIdentity,
  muteThreadByStringId,
  unmuteThreadByStringId,
  hideThreadByStringId,
  unhideThreadByStringId,
  getRoleByStringId,
};
