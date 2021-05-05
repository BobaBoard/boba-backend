-- The return type of this query is DbActivityThreadType.
-- If updating, please also update DbActivityThreadType in Types.
SELECT
    first_post_string_id as post_id,
    NULL as parent_post_id,
    thread_string_id as thread_id,
    board_slug,
    -- Author details
    author,
    author_identity.username,
    author_identity.user_avatar,
    author_identity.secret_identity_name,
    author_identity.secret_identity_avatar,
    author_identity.secret_identity_color,
    author_identity.accessory_avatar,
    COALESCE(friend_thread, FALSE) as friend,
    COALESCE(own_thread, FALSE) as self,    
    -- Generic details
    content,
    thread_details.options,
    thread_details.default_view,
    COALESCE(muted, FALSE) as muted,
    COALESCE(hidden, FALSE) as hidden,
    -- Time details
    TO_CHAR(first_post_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS') as created,
        -- This last activity must have the .US at the end or it will trigger a bug
        -- where some posts are skipped by the last activity cursor.
        -- See documentation on the queries JS file.
    TO_CHAR(last_update_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS.US') as thread_last_activity,
    -- Amount details
    COALESCE(posts_amount, 0) as posts_amount,
    COALESCE(threads_amount, 0) as threads_amount,
    COALESCE(comments_amount, 0) as comments_amount,
    COALESCE(new_posts_board_amount, 0) as new_posts_amount,
    COALESCE(new_comments_board_amount, 0) as new_comments_amount,
    COALESCE(is_new_board, FALSE) as is_new,
    -- post tags
    whisper_tags,
    index_tags,
    content_warnings,
    category_tags
FROM (
  SELECT * FROM threads
  INNER JOIN user_thread_identities uti 
  ON uti.thread_id = threads.id AND uti.user_id = (SELECT id FROM users WHERE users.firebase_id = ${firebase_id} LIMIT 1)
) AS threads
INNER JOIN thread_details
   ON threads.id = thread_details.thread_id
LEFT JOIN thread_identities author_identity
    ON author_identity.user_id = thread_details.author AND author_identity.thread_id = thread_details.thread_id
LEFT JOIN thread_user_details
   ON ${firebase_id} IS NOT NULL AND thread_user_details.user_id = (SELECT id FROM users WHERE users.firebase_id = ${firebase_id} LIMIT 1)
         AND thread_details.thread_id = thread_user_details.thread_id
WHERE
   -- activity cursor condition
   last_update_timestamp <= COALESCE(${last_activity_cursor}, NOW())
   AND (${updated_only} IS FALSE OR new_posts_board_amount > 0 or new_comments_board_amount > 0 or is_new_board)
   AND (${own_only} IS FALSE OR own_thread IS TRUE)
   AND muted IS FALSE
   AND hidden IS FALSE
ORDER BY thread_last_activity DESC
LIMIT ${page_size} + 1