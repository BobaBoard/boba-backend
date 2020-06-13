WITH logged_in_user AS
    (SELECT id FROM users WHERE users.firebase_id = ${firebase_id})
SELECT 
    boards.slug,
    boards.tagline,
    boards.avatar_reference_id,
    boards.settings,
    COUNT(threads.id) as threads_count,
    MAX(posts.last_activity) as last_post,
    MAX(comments.last_activity) as last_comment,
    MAX(GREATEST(user_board_last_visits.last_visit_time, posts.last_thread_visit)) as last_visit,
    BOOL_OR(posts.has_new OR comments.has_new) as has_updates
FROM boards
LEFT JOIN threads 
    ON boards.id = threads.parent_board
LEFT JOIN logged_in_user ON 1 = 1
LEFT JOIN user_board_last_visits
    ON user_board_last_visits.board_id = boards.id 
        AND user_board_last_visits.user_id = logged_in_user.id
LEFT JOIN LATERAL (
        SELECT 
            MAX(created) as last_activity,
            COALESCE(BOOL_OR(logged_in_user.id IS NOT NULL AND 
                             posts.author != logged_in_user.id AND 
                             (utlv.last_visit_time IS NULL OR utlv.last_visit_time < posts.created)), 
                     FALSE) as has_new,
            MAX(utlv.last_visit_time) as last_thread_visit
        FROM posts
        LEFT JOIN logged_in_user ON 1 = 1
        LEFT JOIN user_thread_last_visits as utlv
            ON logged_in_user.id = utlv.user_id
            AND posts.parent_thread = utlv.thread_id
        WHERE posts.parent_thread = threads.id) as posts
    ON 1=1
LEFT JOIN LATERAL (
        SELECT 
            MAX(created) as last_activity,
            COALESCE(BOOL_OR(logged_in_user.id IS NOT NULL AND 
                             comments.author != logged_in_user.id AND
                             (utlv.last_visit_time IS NULL OR utlv.last_visit_time < comments.created)),
                     FALSE) as has_new
        FROM comments 
        LEFT JOIN logged_in_user ON 1 = 1
        LEFT JOIN user_thread_last_visits as utlv
            ON logged_in_user.id = utlv.user_id
            AND comments.parent_thread = utlv.thread_id
        WHERE comments.parent_thread = threads.id) as comments
    ON 1=1
GROUP BY boards.id