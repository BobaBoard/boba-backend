import pg, { QueryFile } from "pg-promise";

import path from "path";

const markBoardVisit = `
    INSERT INTO user_board_last_visits(user_id, board_id) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
        (SELECT id from boards WHERE boards.string_id = $/board_id/))
    ON CONFLICT(user_id, board_id) DO UPDATE
        SET last_visit_time = DEFAULT
        WHERE user_board_last_visits.user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
            AND user_board_last_visits.board_id = (SELECT id from boards WHERE boards.string_id = $/board_id/)`;

const deleteSectionCategories = `
    DELETE FROM board_description_section_categories bdsc
    USING board_description_sections bds
    WHERE
        bds.string_id = $/section_id/ AND
        bds.id = bdsc.section_id AND
        bds.board_id = (SELECT id from boards WHERE boards.string_id = $/board_id/) AND
        ($/category_names/ IS NULL OR bdsc.category_id IN (SELECT id FROM categories WHERE category = ANY($/category_names/)));`;

const deleteSection = `
    DELETE FROM board_description_sections bds
    WHERE
        bds.string_id = $/section_id/ AND
        bds.board_id = (SELECT id from boards WHERE boards.string_id = $/board_id/);`;

const updateSection = `
    UPDATE board_description_sections bds
    SET
        title = $/title/,
        description = $/description/,
        index = $/index/
    FROM boards
    WHERE
        boards.id = bds.board_id
        AND bds.board_id  = (SELECT id from boards WHERE boards.string_id = $/board_id/)
        AND bds.string_id = $/section_id/
    RETURNING *;
`;

const createSection = `
    INSERT INTO board_description_sections(string_id, board_id, title, description, index, type)
    VALUES(
        $/section_id/,
        (SELECT id from boards WHERE boards.string_id = $/board_id/),
        $/title/,
        $/description/,
        $/index/,
        $/type/
    )
    RETURNING *;
`;

const pgInstance = pg();
const createAddCategoriesToFilterSectionQuery = (
  sectionId: string,
  categories: string[]
) => {
  const insertCategoryQuery = `
      INSERT INTO board_description_section_categories(section_id, category_id)
      VALUES(
        (SELECT id FROM board_description_sections WHERE string_id = $/section_id/),
        (SELECT id FROM categories WHERE category = $/category/))
      ON CONFLICT DO NOTHING;`;
  return pgInstance.helpers.concat(
    categories.map((category) => ({
      query: insertCategoryQuery,
      values: {
        section_id: sectionId,
        category: category.toLowerCase(),
      },
    }))
  );
};

const muteBoardByExternalId = `
    INSERT INTO user_muted_boards(user_id, board_id) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
        (SELECT id from boards WHERE boards.string_id = $/board_id/))
    ON CONFLICT(user_id, board_id) DO NOTHING`;

const unmuteBoardByExternalId = `
    DELETE FROM user_muted_boards WHERE
        user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
        AND
        board_id = (SELECT id from boards WHERE boards.string_id = $/board_id/)`;

const pinBoardByExternalId = `
    INSERT INTO user_pinned_boards(user_id, board_id) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
        (SELECT id from boards WHERE boards.string_id = $/board_id/))
    ON CONFLICT(user_id, board_id) DO NOTHING`;

const unpinBoardByExternalId = `
    DELETE FROM user_pinned_boards WHERE
        user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
        AND
        board_id = (SELECT id from boards WHERE boards.string_id = $/board_id/)`;

const dismissNotificationsByExternalId = `
    INSERT INTO dismiss_board_notifications_requests(user_id, board_id, dismiss_request_time) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
        (SELECT id from boards WHERE boards.string_id = $/board_id/),
        DEFAULT)
    ON CONFLICT(user_id, board_id) DO UPDATE
        SET dismiss_request_time = DEFAULT
        WHERE
            dismiss_board_notifications_requests.user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
            AND dismiss_board_notifications_requests.board_id = (SELECT id from boards WHERE boards.string_id = $/board_id/)`;

const updateBoardSettings = `
    UPDATE boards
    SET tagline = $/tagline/,
        settings = $/settings/
    WHERE boards.string_id = $/board_id/`;

const fetchRolesInBoard = `
    SELECT
        users.firebase_id as user_firebase_id,
        users.username as username,
        roles.string_id as role_string_id,
        roles.name as role_name,
        board_user_roles.label as label
    FROM board_user_roles
    INNER JOIN boards ON board_user_roles.board_id = boards.id
    INNER JOIN roles ON board_user_roles.role_id=roles.id
    INNER JOIN users ON users.id=board_user_roles.user_id
    WHERE boards.string_id = $/board_external_id/`;

const getBoardInternalId = `SELECT id from boards WHERE boards.string_id = $/board_external_id/;`;

const deleteBoard = `
    DELETE FROM post_categories WHERE post_id IN (SELECT id FROM posts WHERE posts.parent_thread IN (SELECT id FROM threads WHERE parent_board = $/board_id/));
    DELETE FROM post_warnings WHERE post_id IN (SELECT id FROM posts WHERE posts.parent_thread IN (SELECT id FROM threads WHERE parent_board = $/board_id/));
    DELETE FROM post_tags WHERE post_id IN (SELECT id FROM post_tags WHERE post_tags.post_id IN (SELECT id FROM threads WHERE parent_board = $/board_id/));
    DELETE FROM comments WHERE id IN (SELECT id FROM comments WHERE comments.parent_thread IN (SELECT id FROM threads WHERE parent_board = $/board_id/));
    DELETE FROM posts WHERE id IN (SELECT id FROM posts WHERE posts.parent_thread IN (SELECT id FROM threads WHERE parent_board = $/board_id/));
    DELETE FROM user_thread_identities WHERE thread_id IN (SELECT id FROM threads WHERE parent_board = $/board_id/);
    DELETE FROM user_thread_last_visits WHERE thread_id IN (SELECT id FROM threads WHERE parent_board = $/board_id/);
    DELETE FROM user_starred_threads WHERE thread_id IN (SELECT id FROM threads WHERE parent_board = $/board_id/);
    DELETE FROM identity_thread_accessories WHERE thread_id IN (SELECT id FROM threads WHERE parent_board = $/board_id/);
    DELETE FROM threads WHERE parent_board = $/board_id/;
    DELETE FROM user_board_last_visits WHERE board_id = $/board_id/;
    DELETE FROM user_pinned_boards WHERE board_id = $/board_id/;
    DELETE FROM board_description_section_categories WHERE section_id IN (SELECT id FROM board_description_sections WHERE board_id = $/board_id/);
    DELETE FROM board_description_sections WHERE board_id = $/board_id/;
    DELETE FROM board_user_roles WHERE board_id = $/board_id/;
    DELETE FROM board_category_subscriptions WHERE board_id = $/board_id/;
    DELETE FROM boards WHERE id = $/board_id/;`;

export default {
  getAllBoards: new QueryFile(path.join(__dirname, "all-boards.sql")),
  getBoardByExternalId: new QueryFile(
    path.join(__dirname, "board-by-external-id.sql")
  ),
  markBoardVisit,
  deleteSectionCategories,
  deleteSection,
  updateSection,
  createSection,
  updateBoardSettings,
  createAddCategoriesToFilterSectionQuery,
  muteBoardByExternalId,
  unmuteBoardByExternalId,
  pinBoardByExternalId,
  unpinBoardByExternalId,
  dismissNotificationsByExternalId,
  fetchRolesInBoard,
  deleteBoard,
  getBoardInternalId,
};
