import { QueryFile } from "pg-promise";
import path from "path";

const createThread = `
    INSERT INTO threads(string_id, parent_board, options)
    VALUES (
      $/thread_string_id/,
      (SELECT id FROM boards WHERE boards.string_id = $/board_string_id/),
      $/thread_options/)
    RETURNING id`;

const getRandomIdentityId = `
    SELECT id FROM secret_identities ORDER BY RANDOM() LIMIT 1`;

/**
 * Returns role data given the string id iff such a role is present for the given board & user.
 *
 * We add limit 1 cause the role might be associated to the user in more than one board/realm,
 * but we're only interested in whether it's associated to them at all.
 */
// TODO: rename to getRoleByStringId
const getRoleByStringIdAndBoardId = `
    SELECT
      roles.id,
      roles.name,
      roles.avatar_reference_id,
      roles.color,
      to_json(roles.permissions) as permissions
    FROM roles
    LEFT JOIN board_user_roles bur
      ON roles.id = bur.role_id
    LEFT JOIN realm_user_roles rur
      ON roles.id = rur.role_id
    INNER JOIN users
      ON users.id = bur.user_id  OR users.id = rur.user_id
    WHERE
      roles.string_id = $/role_id/
      AND (rur.role_id IS NOT NULL OR bur.board_id  = (SELECT id FROM boards WHERE boards.string_id = $/board_string_id/))
      AND users.firebase_id = $/firebase_id/
    LIMIT 1`;

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

const starThreadByStringId = `
  INSERT INTO user_starred_threads(user_id, thread_id) VALUES (
      (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
      (SELECT id from threads WHERE threads.string_id = $/thread_string_id/))
  ON CONFLICT(user_id, thread_id) DO NOTHING`;

const unstarThreadByStringId = `
  DELETE FROM user_starred_threads WHERE
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

const updateThreadViewByStringId = `
    UPDATE threads
      SET options = jsonb_set(options, '{default_view}', to_jsonb($/thread_default_view/::text))
      WHERE threads.string_id = $/thread_string_id/
    RETURNING *;
`;

const getThreadDetails = `
    SELECT
      boards.slug as parent_board_slug,
      users.firebase_id = $/firebase_id/ as is_thread_owner
    FROM threads
      LEFT JOIN boards ON threads.parent_board = boards.id
      LEFT JOIN posts ON threads.id = posts.parent_thread AND posts.parent_post IS NULL
      LEFT JOIN users ON posts.author = users.id
    WHERE threads.string_id = $/thread_string_id/
`;

const moveThread = `
    UPDATE threads
    SET parent_board = (SELECT id FROM boards WHERE boards.string_id = $/board_string_id/)
    WHERE string_id = $/thread_string_id/;
`;

export default {
  threadByStringId: new QueryFile(
    path.join(__dirname, "thread-by-string-id.sql")
  ),
  visitThreadByStringId: new QueryFile(
    path.join(__dirname, "visit-thread-by-string-id.sql")
  ),
  createThread,
  getRandomIdentityId,
  insertNewIdentity,
  muteThreadByStringId,
  unmuteThreadByStringId,
  starThreadByStringId,
  unstarThreadByStringId,
  hideThreadByStringId,
  unhideThreadByStringId,
  updateThreadViewByStringId,
  getRoleByStringIdAndBoardId,
  getThreadDetails,
  moveThread,
};
