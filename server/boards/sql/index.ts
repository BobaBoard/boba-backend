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
};
