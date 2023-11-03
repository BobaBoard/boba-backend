import { QueryFile } from "pg-promise";
import path from "path";

const createThread = `
    INSERT INTO threads(string_id, parent_board, options)
    VALUES (
      $/thread_external_id/,
      (SELECT id FROM boards WHERE boards.string_id = $/board_external_id/),
      $/thread_options/)
    RETURNING id`;

const getRandomIdentityId = `
    SELECT id FROM secret_identities ORDER BY RANDOM() LIMIT 1`;

/**
 * Returns role data given the role external id if (and only if) such a role is assigned to the user
 * on the given board.
 */
const getUserBoardRoleByExternalId = `
    WITH logged_in_user AS
      (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
    SELECT DISTINCT ON (roles.id)
      realm_user_roles.*,
      roles.id,
      roles.name,
      roles.avatar_reference_id,
      roles.color,
      to_json(roles.permissions) as permissions
    FROM roles
    LEFT JOIN logged_in_user ON 1=1
    LEFT JOIN board_user_roles board_user_roles
      ON roles.id = board_user_roles.role_id AND board_user_roles.user_id = logged_in_user.id
    LEFT JOIN realm_user_roles
      ON roles.id = realm_user_roles.role_id AND realm_user_roles.user_id = logged_in_user.id
      AND realm_user_roles.realm_id = (SELECT parent_realm_id FROM boards WHERE boards.string_id = $/board_external_id/)
    INNER JOIN users
      ON logged_in_user.id = users.id
    WHERE
      roles.string_id = $/role_external_id/
      AND (realm_user_roles.role_id IS NOT NULL OR board_user_roles.board_id  = (SELECT id FROM boards WHERE boards.string_id = $/board_external_id/))`;

const insertNewIdentity = `
    INSERT INTO user_thread_identities(thread_id, user_id, identity_id, role_id)
    VALUES(
      $/thread_id/,
      (SELECT id FROM users WHERE firebase_id = $/firebase_id/),
      $/secret_identity_id/,
      $/role_id/)`;

const muteThreadByExternalId = `
    INSERT INTO user_muted_threads(user_id, thread_id) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
        (SELECT id from threads WHERE threads.string_id = $/thread_external_id/))
    ON CONFLICT(user_id, thread_id) DO NOTHING`;

const unmuteThreadByExternalId = `
    DELETE FROM user_muted_threads WHERE
        user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
        AND
        thread_id = (SELECT id from threads WHERE threads.string_id = $/thread_external_id/)`;

const starThreadByExternalId = `
  INSERT INTO user_starred_threads(user_id, thread_id) VALUES (
      (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
      (SELECT id from threads WHERE threads.string_id = $/thread_external_id/))
  ON CONFLICT(user_id, thread_id) DO NOTHING`;

const unstarThreadByExternalId = `
  DELETE FROM user_starred_threads WHERE
      user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
      AND
      thread_id = (SELECT id from threads WHERE threads.string_id = $/thread_external_id/)`;

const hideThreadByExternalId = `
    INSERT INTO user_hidden_threads(user_id, thread_id) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
        (SELECT id from threads WHERE threads.string_id = $/thread_external_id/))
    ON CONFLICT(user_id, thread_id) DO NOTHING`;

const unhideThreadByExternalId = `
    DELETE FROM user_hidden_threads WHERE
        user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
        AND
        thread_id = (SELECT id from threads WHERE threads.string_id = $/thread_external_id/)`;

const updateThreadViewByExternalId = `
    UPDATE threads
      SET options = jsonb_set(options, '{default_view}', to_jsonb($/thread_default_view/::text))
      WHERE threads.string_id = $/thread_external_id/
    RETURNING *;
`;

const getThreadDetails = `
    SELECT
      boards.string_id as parent_board_id,
      boards.slug as parent_board_slug,
      users.firebase_id = $/firebase_id/ as is_thread_owner
    FROM threads
      LEFT JOIN boards ON threads.parent_board = boards.id
      LEFT JOIN posts ON threads.id = posts.parent_thread AND posts.parent_post IS NULL
      LEFT JOIN users ON posts.author = users.id
    WHERE threads.string_id = $/thread_external_id/
`;

const moveThread = `
    UPDATE threads
    SET parent_board = (SELECT id FROM boards WHERE boards.string_id = $/board_external_id/)
    WHERE string_id = $/thread_external_id/;
`;

export default {
  threadByExternalId: new QueryFile(
    path.join(__dirname, "thread-by-external-id.sql")
  ),
  visitThreadByExternalId: new QueryFile(
    path.join(__dirname, "visit-thread-by-external-id.sql")
  ),
  createThread,
  getRandomIdentityId,
  insertNewIdentity,
  muteThreadByExternalId,
  unmuteThreadByExternalId,
  starThreadByExternalId,
  unstarThreadByExternalId,
  hideThreadByExternalId,
  unhideThreadByExternalId,
  updateThreadViewByExternalId,
  getUserBoardRoleByExternalId,
  getThreadDetails,
  moveThread,
};
