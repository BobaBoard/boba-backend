-- Fetches data for all boards in a realm or galaxy
WITH 
  logged_in_user AS
    (SELECT id FROM users WHERE users.firebase_id = ${firebase_id}),
  ordered_pinned_boards AS
    (SELECT row_number() OVER(ORDER BY id) AS index, board_id, user_id FROM user_pinned_boards),
  last_board_visits AS (
    SELECT 
        boards.id as board_id,
        MAX(last_visit_time) AS last_board_visit_at
    FROM realms
    INNER JOIN boards
        ON boards.parent_realm_id = realms.id
    INNER JOIN logged_in_user ON 1=1
    INNER JOIN user_board_last_visits ublv
        ON boards.id = ublv.board_id AND ublv.user_id = logged_in_user.id
    WHERE $/realm_external_id/ IS NULL OR realms.string_id = $/realm_external_id/
    GROUP BY boards.id),
  last_thread_visits AS (
    SELECT 
        boards.id as board_id,
        MAX(last_visit_time) AS last_thread_visit_at
    FROM realms
    INNER JOIN boards
        ON boards.parent_realm_id = realms.id
    INNER JOIN threads
        ON threads.parent_board = boards.id
    INNER JOIN logged_in_user ON 1=1
    INNER JOIN user_thread_last_visits utlv
        ON threads.id = utlv.thread_id AND utlv.user_id = logged_in_user.id
    WHERE $/realm_external_id/ IS NULL OR realms.string_id = $/realm_external_id/
    GROUP BY boards.id),
  post_notifications AS (
    SELECT
        boards.id as board_id,
        MAX(posts.created) as last_post_at,
        MAX(posts.created) FILTER (WHERE posts.author != logged_in_user.id AND (thread_cutoff_time IS NULL OR posts.created > thread_cutoff_time)) as last_post_from_others_at,
        BOOL_OR(posts.author != logged_in_user.id AND (thread_cutoff_time IS NULL OR posts.created > thread_cutoff_time)) as has_new_post
    FROM realms
    INNER JOIN boards
        ON realms.id = boards.parent_realm_id
    INNER JOIN threads
        ON threads.parent_board = boards.id
    INNER JOIN posts
        ON posts.parent_thread = threads.id
    INNER JOIN logged_in_user
        ON 1=1
    LEFT JOIN thread_notification_dismissals tnd
        ON threads.id = tnd.thread_id AND tnd.user_id = logged_in_user.id
    LEFT JOIN user_muted_threads
        ON user_muted_threads.user_id = logged_in_user.id
            AND user_muted_threads.thread_id = threads.id
    LEFT JOIN user_muted_boards
        ON user_muted_boards.user_id = logged_in_user.id
            AND user_muted_boards.board_id = threads.parent_board
    LEFT JOIN user_hidden_threads
        ON user_hidden_threads.user_id = logged_in_user.id
            AND user_hidden_threads.thread_id = threads.id
    WHERE 
        ($/realm_external_id/ IS NULL OR realms.string_id = $/realm_external_id/) 
            AND user_muted_threads.id IS NULL AND user_hidden_threads.id IS NULL AND user_muted_boards.id IS NULL
    GROUP BY boards.id),
  comment_notifications AS (
    SELECT
        boards.id as board_id,
        MAX(comments.created) as last_comment_at,
        MAX(comments.created) FILTER (WHERE comments.author != logged_in_user.id IS NULL AND (thread_cutoff_time IS NULL OR comments.created > thread_cutoff_time)) as last_comment_from_others_at,
        BOOL_OR(comments.author != logged_in_user.id IS NULL AND (thread_cutoff_time IS NULL OR comments.created > thread_cutoff_time)) as has_new_comment
    FROM realms
    INNER JOIN boards
        ON realms.id = boards.parent_realm_id
    INNER JOIN threads
        ON threads.parent_board = boards.id
    INNER JOIN comments
        ON comments.parent_thread = threads.id
    INNER JOIN logged_in_user
        ON 1=1
    LEFT JOIN thread_notification_dismissals tnd
        ON threads.id = tnd.thread_id AND tnd.user_id = logged_in_user.id
    LEFT JOIN user_muted_threads
        ON user_muted_threads.user_id = logged_in_user.id
            AND user_muted_threads.thread_id = threads.id
    LEFT JOIN user_muted_boards
        ON user_muted_boards.user_id = logged_in_user.id
            AND user_muted_boards.board_id = threads.parent_board
    LEFT JOIN user_hidden_threads
        ON user_hidden_threads.user_id = logged_in_user.id
            AND user_hidden_threads.thread_id = threads.id
    WHERE 
        ($/realm_external_id/ IS NULL OR realms.string_id = $/realm_external_id/) 
            AND user_muted_threads.id IS NULL AND user_hidden_threads.id IS NULL AND user_muted_boards.id IS NULL
    GROUP BY boards.id),
  last_visits AS (
    SELECT 
        boards.id as board_id,
        MAX(last_visit_time) AS last_visit_at
    FROM boards
    LEFT JOIN logged_in_user ON 1 = 1
    INNER JOIN realms
        ON boards.parent_realm_id = realms.id
    INNER JOIN threads
        ON boards.id = threads.parent_board
    INNER JOIN user_thread_last_visits 
        ON user_thread_last_visits.thread_id = threads.id AND  user_thread_last_visits.user_id = logged_in_user.id
    WHERE $/realm_external_id/ IS NULL OR realms.string_id = $/realm_external_id/
    GROUP BY boards.id)
SELECT 
    boards.slug,
    boards.string_id,
    realms.string_id as realm_external_id,
    boards.tagline,
    boards.avatar_reference_id,
    boards.settings,
    last_post_at as last_post,
    last_comment_at as last_comment,
    GREATEST(user_board_last_visits.last_visit_time, last_visit_at) as last_visit,
    GREATEST(last_post_at, last_comment_at) AS last_activity,
    -- NOTE: last_activity_from_others also considers notification dismissals etc. This makes no sense given the name.
    -- TODO: maybe rename this as "last_notifiable_activity"
    -- TODO: remove this from the board query and make its own notifications query instead.
    GREATEST(last_post_from_others_at, last_comment_from_others_at) AS last_activity_from_others,
    COALESCE(has_new_post OR has_new_comment, FALSE) AS has_updates,
    user_muted_boards.board_id IS NOT NULL as muted,
    COALESCE(ordered_pinned_boards.index, NULL) as pinned_order,
    to_jsonb(COALESCE(logged_out_restrictions, ARRAY[]::board_restrictions_type[])) as logged_out_restrictions,
    to_jsonb(COALESCE(CASE WHEN logged_in_user.id IS NOT NULL THEN logged_in_base_restrictions ELSE NULL END, ARRAY[]::board_restrictions_type[])) as logged_in_base_restrictions
FROM boards
INNER JOIN realms
    ON boards.parent_realm_id = realms.id
LEFT JOIN logged_in_user ON 1 = 1
LEFT JOIN user_muted_boards 
    ON boards.id = user_muted_boards.board_id
        AND user_muted_boards.user_id = logged_in_user.id
LEFT JOIN ordered_pinned_boards 
    ON boards.id = ordered_pinned_boards.board_id
        AND ordered_pinned_boards.user_id = logged_in_user.id
LEFT JOIN last_board_visits 
    ON boards.id = last_board_visits.board_id
LEFT JOIN last_thread_visits 
    ON boards.id = last_thread_visits.board_id
LEFT JOIN post_notifications 
    ON boards.id = post_notifications.board_id
LEFT JOIN comment_notifications 
    ON boards.id = comment_notifications.board_id
LEFT JOIN last_visits 
    ON boards.id = last_visits.board_id
LEFT JOIN board_restrictions
    ON boards.id = board_restrictions.board_id
WHERE $/realm_external_id/ IS NULL OR realms.string_id = $/realm_external_id/
GROUP BY boards.id, user_muted_boards.board_id, ordered_pinned_boards.INDEX, logged_out_restrictions, logged_in_base_restrictions, logged_in_user.id, realms.string_id,
    last_post_at, last_comment_at, last_board_visit_at, last_thread_visit_at,
    last_post_from_others_at, last_comment_from_others_at, has_new_post, has_new_comment