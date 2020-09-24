import { QueryFile } from "pg-promise";
import path from "path";

const getBoardBySlug = `
    WITH logged_in_user AS (
        SELECT id FROM users WHERE firebase_id  = $/firebase_id/
    )
    SELECT 
            boards.slug,
            boards.tagline,
            boards.avatar_reference_id,
            boards.settings,
            COUNT(threads.id) as threads_count,
            COALESCE(json_agg(DISTINCT p.permissions) FILTER (WHERE p.permissions IS NOT NULL), '[]') AS permissions
        FROM boards
        LEFT JOIN threads ON boards.id = threads.parent_board
        LEFT JOIN board_user_roles bur ON boards.id = board_id AND bur.user_id = (SELECT id FROM logged_in_user LIMIT 1)
        LEFT JOIN LATERAL (SELECT UNNEST(roles.permissions) AS permissions FROM roles WHERE bur.role_id = roles.id) AS p ON 1=1
    WHERE boards.slug=$/board_slug/
    GROUP BY boards.id`;

const markBoardVisit = `
    INSERT INTO user_board_last_visits(user_id, board_id) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
        (SELECT id from boards WHERE boards.slug = $/board_slug/))
    ON CONFLICT(user_id, board_id) DO UPDATE 
        SET last_visit_time = DEFAULT
        WHERE user_board_last_visits.user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
            AND user_board_last_visits.board_id = (SELECT id from boards WHERE boards.slug = $/board_slug/)`;

// TODO: fix return types so they are consistent
export default {
  getAllBoards: new QueryFile(path.join(__dirname, "all-boards.sql")),
  getBoardActivityBySlug: new QueryFile(
    path.join(__dirname, "board-activity-by-slug.sql")
  ),
  getBoardBySlug,
  markBoardVisit,
};
