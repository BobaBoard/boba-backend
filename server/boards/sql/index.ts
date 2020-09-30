import { QueryFile } from "pg-promise";
import path from "path";

const getBoardBySlug = `
    SELECT 
        boards.slug,
        boards.tagline,
        boards.avatar_reference_id,
        boards.settings,
        umb.user_id IS NOT NULL as muted,
        COUNT(threads.id) as threads_count
    FROM boards
    LEFT JOIN threads ON boards.id = threads.parent_board
    LEFT JOIN user_muted_boards umb 
        ON boards.id = umb.board_id AND umb.user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
    WHERE boards.slug=$/board_slug/
    GROUP BY boards.id, umb.user_id`;

const markBoardVisit = `
    INSERT INTO user_board_last_visits(user_id, board_id) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
        (SELECT id from boards WHERE boards.slug = $/board_slug/))
    ON CONFLICT(user_id, board_id) DO UPDATE 
        SET last_visit_time = DEFAULT
        WHERE user_board_last_visits.user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
            AND user_board_last_visits.board_id = (SELECT id from boards WHERE boards.slug = $/board_slug/)`;

const muteBoardBySlug = `
    INSERT INTO user_muted_boards(user_id, board_id) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
        (SELECT id from boards WHERE boards.slug = $/board_slug/))
    ON CONFLICT(user_id, board_id) DO NOTHING`;

const unmuteBoardBySlug = `
    DELETE FROM user_muted_boards WHERE
        user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
        AND
        board_id = (SELECT id from boards WHERE boards.slug = $/board_slug/)`;

// TODO: fix return types so they are consistent
export default {
  getAllBoards: new QueryFile(path.join(__dirname, "all-boards.sql")),
  getBoardActivityBySlug: new QueryFile(
    path.join(__dirname, "board-activity-by-slug.sql")
  ),
  getBoardBySlug,
  markBoardVisit,
  muteBoardBySlug,
  unmuteBoardBySlug,
};
