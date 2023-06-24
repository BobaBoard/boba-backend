-- Fetches data for all boards in a realm or galaxy
WITH 
  logged_in_user AS
    (SELECT id FROM users WHERE users.firebase_id = ${firebase_id}),
  ordered_pinned_boards AS
    (SELECT row_number() OVER(ORDER BY id) AS index, board_id, user_id FROM user_pinned_boards)
SELECT 
    boards.slug,
    boards.string_id,
    realms.string_id as realm_external_id,
    board_categories.string_id as board_categories_string_id,
    boards.tagline,
    boards.avatar_reference_id,
    boards.settings,
    MAX(posts.last_activity) as last_post,
    MAX(comments.last_activity) as last_comment,
    GREATEST(MAX(COMMENTS.last_activity), MAX(posts.last_activity)) AS last_activity,
    -- NOTE: last_activity_from_others also considers notification dismissals etc. This makes no sense given the name.
    -- TODO: maybe rename this as "last_notifiable_activity"
    -- TODO: remove this from the board query and make its own notifications query instead.
    GREATEST(MAX(COMMENTS.last_activity_from_others), MAX(posts.last_activity_from_others)) AS last_activity_from_others,
    MAX(GREATEST(user_board_last_visits.last_visit_time, posts.last_thread_visit)) as last_visit,
    user_muted_boards.board_id IS NOT NULL as muted,
    COALESCE(ordered_pinned_boards.index, NULL) as pinned_order,
    BOOL_OR(user_muted_boards.board_id IS NULL AND (posts.has_new OR comments.has_new)) as has_updates,
    to_jsonb(COALESCE(logged_out_restrictions, ARRAY[]::board_restrictions_type[])) as logged_out_restrictions,
    to_jsonb(COALESCE(CASE WHEN logged_in_user.id IS NOT NULL THEN logged_in_base_restrictions ELSE NULL END, ARRAY[]::board_restrictions_type[])) as logged_in_base_restrictions
FROM boards
INNER JOIN realms
    ON boards.parent_realm_id = realms.id
LEFT JOIN board_categories 
    ON boards.board_category_id = board_categories.id
LEFT JOIN logged_in_user ON 1 = 1
LEFT JOIN user_muted_boards 
    ON boards.id = user_muted_boards.board_id
        AND user_muted_boards.user_id = logged_in_user.id
LEFT JOIN ordered_pinned_boards 
    ON boards.id = ordered_pinned_boards.board_id
        AND ordered_pinned_boards.user_id = logged_in_user.id
LEFT JOIN threads 
    ON boards.id = threads.parent_board
LEFT JOIN user_muted_threads
    ON user_muted_threads.user_id = logged_in_user.id
        AND user_muted_threads.thread_id = threads.id
LEFT JOIN user_hidden_threads
    ON user_hidden_threads.user_id = logged_in_user.id
        AND user_hidden_threads.thread_id = threads.id
LEFT JOIN user_board_last_visits
    ON user_board_last_visits.board_id = boards.id 
        AND user_board_last_visits.user_id = logged_in_user.id
LEFT JOIN board_restrictions
    ON boards.id = board_restrictions.board_id
LEFT JOIN LATERAL (
        SELECT 
            MAX(created) as last_activity,
            MAX(CASE WHEN logged_in_user.id IS NOT NULL AND 
                          user_muted_boards IS NULL AND
                          posts.author != logged_in_user.id AND 
                          (utlv.last_visit_time IS NULL OR utlv.last_visit_time < posts.created) AND
                          (dnr.dismiss_request_time IS NULL OR dnr.dismiss_request_time < posts.created) AND
                          (dbnr.dismiss_request_time IS NULL OR dbnr.dismiss_request_time < posts.created) THEN created ELSE NULL END) AS last_activity_from_others,
            COALESCE(BOOL_OR(logged_in_user.id IS NOT NULL AND 
                             posts.author != logged_in_user.id AND 
                             (utlv.last_visit_time IS NULL OR utlv.last_visit_time < posts.created) AND
                             (dnr.dismiss_request_time IS NULL OR dnr.dismiss_request_time < posts.created) AND
                             (dbnr.dismiss_request_time IS NULL OR dbnr.dismiss_request_time < posts.created)), 
                     FALSE) as has_new,
            MAX(utlv.last_visit_time) as last_thread_visit
        FROM posts
        LEFT JOIN logged_in_user ON 1 = 1
        LEFT JOIN user_thread_last_visits as utlv
            ON logged_in_user.id = utlv.user_id
            AND posts.parent_thread = utlv.thread_id
        LEFT JOIN dismiss_notifications_requests dnr
            ON dnr.user_id = logged_in_user.id
         LEFT JOIN dismiss_board_notifications_requests dbnr
            ON dbnr.user_id = logged_in_user.id AND dbnr.board_id = threads.parent_board
        WHERE 
            user_muted_threads.thread_id IS NULL 
            AND user_hidden_threads.thread_id IS NULL 
            AND posts.parent_thread = threads.id) as posts
    ON 1=1
LEFT JOIN LATERAL (
        SELECT 
            MAX(created) as last_activity,
            MAX(CASE WHEN logged_in_user.id IS NOT NULL AND 
                          comments.author != logged_in_user.id AND
                          user_muted_boards IS NULL AND
                          (utlv.last_visit_time IS NULL OR utlv.last_visit_time < comments.created) AND
                          (dnr.dismiss_request_time IS NULL OR dnr.dismiss_request_time < comments.created) AND
                          (dbnr.dismiss_request_time IS NULL OR dbnr.dismiss_request_time < comments.created)
                THEN created ELSE NULL END) AS last_activity_from_others,
            COALESCE(BOOL_OR(logged_in_user.id IS NOT NULL AND 
                             comments.author != logged_in_user.id AND
                             (utlv.last_visit_time IS NULL OR utlv.last_visit_time < comments.created) AND
                             (dnr.dismiss_request_time IS NULL OR dnr.dismiss_request_time < comments.created) AND
                             (dbnr.dismiss_request_time IS NULL OR dbnr.dismiss_request_time < comments.created)),
                     FALSE) as has_new
        FROM comments 
        LEFT JOIN logged_in_user ON 1 = 1
        LEFT JOIN user_thread_last_visits as utlv
            ON logged_in_user.id = utlv.user_id
            AND comments.parent_thread = utlv.thread_id
        LEFT JOIN dismiss_notifications_requests dnr
            ON dnr.user_id = logged_in_user.id
         LEFT JOIN dismiss_board_notifications_requests dbnr
            ON dbnr.user_id = logged_in_user.id AND dbnr.board_id = threads.parent_board
        WHERE 
            user_muted_threads.thread_id IS NULL 
            AND user_hidden_threads.thread_id IS NULL 
            AND comments.parent_thread = threads.id) as comments
    ON 1=1
WHERE $/realm_external_id/ IS NULL OR realms.string_id = $/realm_external_id/
GROUP BY boards.id, user_muted_boards.board_id, ordered_pinned_boards.INDEX, logged_out_restrictions, logged_in_base_restrictions, logged_in_user.id, realms.string_id, board_categories.string_id
