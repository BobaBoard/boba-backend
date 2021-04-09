 WITH
    logged_in_user AS
        (SELECT id FROM users WHERE users.firebase_id = ${firebase_id}),
    last_visited_or_dismissed AS
        (SELECT
            threads.id as thread_id,
            GREATEST(last_visit_time, dnr.dismiss_request_time, dbnr.dismiss_request_time) as cutoff_time
         FROM threads
         INNER JOIN user_thread_identities uti
            ON uti.thread_id = threads.id
         INNER JOIN logged_in_user 
            ON uti.user_id = logged_in_user.id
         LEFT JOIN boards
            ON boards.id = threads.parent_board
         JOIN users
            ON users.firebase_id = ${firebase_id}
         LEFT JOIN user_thread_last_visits
            ON threads.id = user_thread_last_visits.thread_id AND user_thread_last_visits.user_id = users.id
         LEFT JOIN dismiss_notifications_requests dnr
            ON dnr.user_id = users.id
         LEFT JOIN dismiss_board_notifications_requests dbnr
            ON dbnr.user_id = users.id AND dbnr.board_id = threads.parent_board),
    thread_posts_updates AS
        (SELECT
            threads.string_id as threads_string_id,
            threads.id as threads_id,
            slug as board_slug,
            cutoff_time,
            first_post.id as first_post_id,
            first_post.string_id AS first_post_string_id,
            first_post.content AS first_post_content,
            first_post.author AS first_post_author,
            first_post.options AS first_post_options,
            first_post.whisper_tags AS first_post_whisper_tags,
            MIN(posts.created) as first_post_timestamp,
            MAX(posts.created) as last_post_timestamp,
            user_muted_threads.thread_id IS NOT NULL as muted,
            user_hidden_threads.thread_id IS NOT NULL as hidden,
            COALESCE(threads.OPTIONS ->> 'default_view', 'thread')::view_types AS default_view,
            logged_in_user.id IS NOT NULL AND first_post.author = logged_in_user.id AS self,
            friends.user_id IS NOT NULL as friend, 
            COUNT(posts.id)::int as posts_amount,
            -- Count all the new posts that aren't ours, unless we aren't logged in          
            SUM(CASE
                    -- If firebase_id is null then no one is logged in and posts are never new 
                    WHEN ${firebase_id} IS NULL THEN 0
                    -- Firebase id is not null here, but make sure not to count our posts
                    WHEN posts.author = (SELECT id FROM users WHERE firebase_id = ${firebase_id}) THEN 0
                    -- Firebase id is not null and the post is not ours
                    WHEN cutoff_time IS NULL OR cutoff_time < posts.created THEN 1 
                    ELSE 0
                END)::int as new_posts_amount,
            CASE
                -- If firebase_id is null then no one is logged in and posts are never new 
                WHEN ${firebase_id} IS NULL THEN FALSE
                -- Firebase id is not null here, but make sure not to count our posts
                WHEN first_post.author = logged_in_user.id THEN FALSE
                -- Firebase id is not null and the post is not ours
                WHEN cutoff_time IS NULL OR cutoff_time < first_post.created THEN TRUE 
                ELSE FALSE
            END as is_new
         FROM threads
         INNER JOIN user_thread_identities uti
            ON uti.thread_id = threads.id
         INNER JOIN logged_in_user 
            ON uti.user_id = logged_in_user.id
         LEFT JOIN boards
            ON boards.id = threads.parent_board
         LEFT JOIN user_muted_threads
            ON user_muted_threads.user_id = logged_in_user.id
                AND user_muted_threads.thread_id = threads.id
         LEFT JOIN user_hidden_threads
            ON user_hidden_threads.user_id = logged_in_user.id
                AND user_hidden_threads.thread_id = threads.id
         LEFT JOIN posts
            ON posts.parent_thread = threads.id
         LEFT JOIN posts AS first_post
            ON first_post.parent_thread = threads.id AND first_post.parent_post IS NULL
         LEFT JOIN last_visited_or_dismissed
            ON last_visited_or_dismissed.thread_id = threads.id OR last_visited_or_dismissed.thread_id is NULL
         LEFT JOIN friends
            ON first_post.author = friends.user_id AND logged_in_user.id IS NOT NULL AND friends.friend_id = logged_in_user.id
         GROUP BY
            threads.id, boards.id, boards.slug, cutoff_time, user_muted_threads.thread_id, user_hidden_threads.thread_id, 
            first_post.id, logged_in_user.id, friends.user_id),
    thread_comments_updates AS 
        (SELECT
            thread_posts_updates.threads_id as thread_id,
            MAX(comments.created) as last_comment_timestamp,
            COUNT(comments.id)::int as comments_amount,
            -- Count all the new comments that aren't ours, unless we aren't logged in          
            SUM(CASE
                    WHEN ${firebase_id} IS NULL THEN 0
                    -- Firebase id is not null here, but make sure not to count our posts
                    WHEN comments.author = (SELECT id FROM users WHERE firebase_id = ${firebase_id}) THEN 0
                    -- Firebase id is not null and the post is not ours
                    WHEN cutoff_time IS NULL OR cutoff_time < comments.created THEN 1 
                    ELSE 0
                END)::int as  new_comments_amount
         FROM thread_posts_updates 
         INNER JOIN comments
            ON thread_posts_updates.threads_id = comments.parent_thread
         GROUP BY thread_posts_updates.threads_id)
-- The return type of this query is DbActivityThreadType.
-- If updating, please also update DbActivityThreadType in Types.
SELECT
    first_post_string_id as post_id,
    NULL as parent_post_id,
    threads_string_id as thread_id,
    board_slug,
    -- Author details
    user_id as author,
    username,
    user_avatar,
    secret_identity as secret_identity_name,
    secret_avatar as secret_identity_avatar,
    secret_color as secret_identity_color,
    accessory_avatar,
    friend,
    self,    
    -- Generic details
    first_post_content as content,
    first_post_options as options,
    muted,
    hidden,
    default_view,
    -- Time details
    TO_CHAR(first_post_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS') as created,
        -- This last activity must have the .US at the end or it will trigger a bug
        -- where some posts are skipped by the last activity cursor.
        -- See documentation on the queries JS file.
    TO_CHAR(GREATEST(first_post_timestamp , last_post_timestamp, last_comment_timestamp), 'YYYY-MM-DD"T"HH24:MI:SS.US') as thread_last_activity,
    -- Amount details
    COALESCE(posts_amount, 0) as posts_amount,
    (SELECT COUNT(*)::int as count FROM posts WHERE posts.parent_post = first_post_id) as threads_amount,
    COALESCE(comments_amount, 0) as comments_amount,
    COALESCE(new_posts_amount, 0) as new_posts_amount,
    COALESCE(new_comments_amount, 0) as new_comments_amount,
    is_new,
    -- post tags
    COALESCE(first_post_whisper_tags, ARRAY[]::text[]) as whisper_tags,
    array(
        SELECT tag FROM post_tags 
        LEFT JOIN tags
        ON post_tags.tag_id = tags.id WHERE post_tags.post_id = first_post_id) as index_tags,
    array(
        SELECT category FROM post_categories 
        LEFT JOIN categories
        ON post_categories.category_id = categories.id WHERE post_categories.post_id = first_post_id) as category_tags,
    array(
        SELECT warning FROM post_warnings 
        LEFT JOIN content_warnings
        ON post_warnings.warning_id = content_warnings.id WHERE post_warnings.post_id = first_post_id) as content_warnings
FROM thread_posts_updates
LEFT JOIN thread_comments_updates
    ON thread_posts_updates.threads_id = thread_comments_updates.thread_id
LEFT JOIN thread_identities
    ON thread_identities.user_id = (thread_posts_updates.first_post_author)::int AND thread_identities.thread_id = thread_posts_updates.threads_id
WHERE GREATEST(thread_posts_updates.first_post_timestamp, thread_posts_updates.last_post_timestamp, thread_comments_updates.last_comment_timestamp) <= COALESCE(${last_activity_cursor}, NOW())
   AND (${updated_only} IS FALSE OR new_posts_amount > 0 or new_comments_amount > 0 or is_new)
   AND (${own_only} IS FALSE OR self IS TRUE)
   AND muted IS FALSE
   AND hidden IS FALSE
ORDER BY thread_last_activity DESC
LIMIT ${page_size} + 1 
