SELECT 
    boards.slug,
    boards.tagline,
    boards.avatar_reference_id,
    boards.settings,
    COUNT(threads.id) as threads_count,
    MAX(posts.last_activity) as last_post,
    MAX(comments.last_activity) as last_comment,
    MAX(user_board_last_visits.last_visit_time) last_visit,
    CASE 
        WHEN MAX(posts.last_activity) IS NOT NULL OR MAX(comments.last_activity) IS NOT NULL
        THEN COALESCE(MAX(user_board_last_visits.last_visit_time), '-infinity') < GREATEST(MAX(posts.last_activity), MAX(comments.last_activity))
        ELSE false
    END as has_updates
FROM boards
LEFT JOIN threads 
    ON boards.id = threads.parent_board
LEFT JOIN user_board_last_visits
    ON user_board_last_visits.board_id = boards.id 
        AND user_board_last_visits.user_id = (SELECT id FROM users WHERE users.firebase_id = ${firebase_id})
LEFT JOIN LATERAL (
    SELECT MAX(created) as last_activity FROM posts WHERE posts.parent_thread = threads.id) as posts
    ON 1=1
LEFT JOIN LATERAL (
    SELECT MAX(created) as last_activity FROM comments WHERE comments.parent_thread = threads.id) as comments
    ON 1=1
GROUP BY boards.id