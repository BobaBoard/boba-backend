 WITH 
    thread_identities AS
        (SELECT
            uti.thread_id as thread_id,
            uti.user_id as user_id,
            users.username as username,
            users.avatar_reference_id as user_avatar,
            secret_identities.display_name as secret_identity,
            secret_identities.avatar_reference_id as secret_avatar
         FROM user_thread_identities AS uti 
         INNER JOIN users 
            ON uti.user_id = users.id 
         INNER JOIN secret_identities 
            ON secret_identities.id = uti.identity_id),
    last_visited_or_dismissed AS
        (SELECT
            threads.id as thread_id,
            GREATEST(last_visit_time, dismiss_request_time) as cutoff_time
         FROM threads
         INNER JOIN boards
            ON boards.id = threads.parent_board AND boards.slug = ${board_slug}
         JOIN users
            ON users.firebase_id = ${firebase_id}
         LEFT JOIN user_thread_last_visits
            ON threads.id = user_thread_last_visits.thread_id AND user_thread_last_visits.user_id = users.id
         LEFT JOIN dismiss_notifications_requests
            ON dismiss_notifications_requests.user_id = users.id),
    thread_posts_updates AS
        (SELECT
            threads.string_id as threads_string_id,
            threads.id as threads_id,
            cutoff_time,
            MIN(posts.created) as first_post,
            MAX(posts.created) as last_post,
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
                END)::int as new_posts_amount
         FROM boards 
         LEFT JOIN threads
            ON boards.id = threads.parent_board
         LEFT JOIN posts
            ON posts.parent_thread = threads.id
         LEFT JOIN last_visited_or_dismissed
            ON last_visited_or_dismissed.thread_id = threads.id OR last_visited_or_dismissed.thread_id is NULL
         WHERE boards.slug = ${board_slug}
         GROUP BY
            threads.id, boards.id, cutoff_time)
-- The return type of this query is DbActivityThreadType.
-- If updating, please also update DbActivityThreadType in Types.
SELECT
    first_post.string_id as post_id,
    NULL as parent_post_id,
    threads_string_id as thread_id,
    user_id as author,
    username,
    user_avatar,
    secret_identity as secret_identity_name,
    secret_avatar as secret_identity_avatar,
    TO_CHAR(created, 'YYYY-MM-DD"T"HH24:MI:SS') as created,
    content,
    options,
    whisper_tags,
    array(
        SELECT tag FROM post_tags 
        LEFT JOIN tags
        ON post_tags.tag_id = tags.id WHERE post_tags.post_id = first_post.id) as index_tags,
    COALESCE(posts_amount, 0) as posts_amount,
    threads_amount.count as threads_amount,
    -- This last activity must have the .US at the end or it will trigger a bug
    -- where some posts are skipped by the last activity cursor.
    -- See documentation on the queries JS file.
    TO_CHAR(GREATEST(first_post, last_post, last_comment), 'YYYY-MM-DD"T"HH24:MI:SS.US') as thread_last_activity,
    COALESCE(is_friend.friend, FALSE) as friend,
    COALESCE(user_id = (SELECT id FROM users WHERE firebase_id = ${firebase_id}), FALSE) as self,
    COALESCE(new_posts_amount, 0) as new_posts_amount,
    COALESCE(new_comments_amount, 0) as new_comments_amount,
    TO_CHAR(last_comment, 'YYYY-MM-DD"T"HH24:MI:SS') as last_comment,
    CASE
        -- If firebase_id is null then no one is logged in and posts are never new 
        WHEN ${firebase_id} IS NULL THEN FALSE
        -- Firebase id is not null here, but make sure not to count our posts
        WHEN first_post.author = (SELECT id FROM users WHERE firebase_id = ${firebase_id}) THEN FALSE
        -- Firebase id is not null and the post is not ours
        WHEN cutoff_time IS NULL OR cutoff_time < first_post.created THEN TRUE 
        ELSE FALSE
    END as is_new,
    COALESCE(comments_amount, 0) as comments_amount
FROM
    thread_posts_updates
LEFT JOIN 
        (SELECT
            thread_posts_updates.threads_id as thread_id,
            MAX(comments.created) as last_comment,
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
         GROUP BY thread_posts_updates.threads_id) as thread_comments_updates
    ON thread_posts_updates.threads_id = thread_comments_updates.thread_id
LEFT JOIN posts as first_post
    ON thread_posts_updates.threads_id = first_post.parent_thread AND first_post.created = thread_posts_updates.first_post
LEFT JOIN thread_identities
    ON thread_identities.user_id = first_post.author AND thread_identities.thread_id = first_post.parent_thread
LEFT JOIN LATERAL (SELECT COUNT(*)::int as count FROM posts WHERE posts.parent_post = first_post.id) as threads_amount
    ON true
LEFT JOIN LATERAL 
        (SELECT true as friend 
         FROM friends 
         WHERE
            ${firebase_id} IS NOT NULL AND
            friends.user_id = (SELECT id FROM users WHERE firebase_id = ${firebase_id}) AND 
            friends.friend_id = author
        LIMIT 1) as is_friend 
    ON true
WHERE GREATEST(first_post, last_post, last_comment) <= COALESCE(${last_activity_cursor}, NOW())
ORDER BY thread_last_activity DESC
LIMIT ${page_size} + 1
