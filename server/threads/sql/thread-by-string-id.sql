WITH
    last_visited_or_dismissed AS
        (SELECT
            GREATEST(last_visit_time, dismiss_request_time) as cutoff_time
         FROM threads
         JOIN users
            ON users.firebase_id = ${firebase_id}
         LEFT JOIN user_thread_last_visits
            ON threads.id = user_thread_last_visits.thread_id AND user_thread_last_visits.user_id = users.id
         LEFT JOIN dismiss_notifications_requests
            ON dismiss_notifications_requests.user_id = users.id
         WHERE threads.string_id = ${thread_string_id}),
    thread_comments AS
        (SELECT 
            thread_comments.parent_post,
            -- Count all the new comments that aren't ours, unless we aren't logged in.
            COALESCE(SUM((${firebase_id} IS NOT NULL AND is_new AND NOT is_own)::int), 0) as new_comments,
            COALESCE(COUNT(*), 0) as total_comments,
            json_agg(json_build_object(
                'id', thread_comments.string_id,
                'parent_post', thread_comments.parent_thread_string_id,
                'author', thread_comments.author,
                'content', thread_comments.content,
                'created',  TO_CHAR(thread_comments.created, 'YYYY-MM-DD"T"HH24:MI:SS'),
                'anonymity_type', thread_comments.anonymity_type,
                'is_new', (is_new AND NOT is_own),
                'is_own', is_own
            ) ORDER BY thread_comments.created ASC) as comments 
         FROM (
            SELECT 
                comments.*,
                ${firebase_id} IS NOT NULL AND comments.author = (SELECT id FROM users WHERE firebase_id = ${firebase_id}) as is_own,
                ${firebase_id} IS NOT NULL AND (cutoff_time IS NULL OR cutoff_time < comments.created) as is_new,
                threads.string_id as parent_thread_string_id,
                last_visited_or_dismissed.cutoff_time
            FROM comments 
            LEFT JOIN threads
                ON comments.parent_thread = threads.id
            LEFT JOIN last_visited_or_dismissed ON 1=1
            WHERE threads.string_id = ${thread_string_id}) as thread_comments
         GROUP BY thread_comments.parent_post),
    thread_posts AS
        (SELECT 
            posts.string_id as post_id,
            posts.parent_thread as parent_thread_id,
            parent.string_id as parent_post_id,
            posts.author,
            TO_CHAR(posts.created, 'YYYY-MM-DD"T"HH24:MI:SS') as created,
            posts.content,
            posts.options,
            posts.type,
            posts.whisper_tags,
            posts.anonymity_type,
            COALESCE(thread_comments.total_comments, 0) as total_comments_amount,
            COALESCE(thread_comments.new_comments, 0) as new_comments_amount,
            thread_comments.comments,
            COALESCE(${firebase_id} IS NOT NULL AND posts.author = (SELECT id FROM users WHERE firebase_id = ${firebase_id}), FALSE) as is_own,
            CASE
                WHEN ${firebase_id} IS NULL THEN FALSE
                -- Firebase id is not null here, but make sure not to count our posts
                WHEN posts.author = (SELECT id FROM users WHERE firebase_id = ${firebase_id}) THEN FALSE
                -- Firebase id is not null and the post is not ours
                WHEN cutoff_time IS NULL OR cutoff_time < posts.created THEN TRUE 
                ELSE FALSE
            END as is_new
         FROM posts               
         LEFT JOIN posts as parent
            ON posts.parent_post = parent.id
         LEFT JOIN threads
            ON posts.parent_thread = threads.id
         LEFT JOIN thread_comments 
            ON posts.id = thread_comments.parent_post
         LEFT JOIN last_visited_or_dismissed ON 1=1
         WHERE threads.string_id = ${thread_string_id})
SELECT 
    threads.string_id, 
    json_agg(row_to_json(thread_posts) ORDER BY thread_posts.created ASC) as posts,
    COALESCE(SUM(thread_posts.new_comments_amount)::int, 0) as new_comments_amount,
    COALESCE(SUM(thread_posts.total_comments_amount)::int, 0) as total_comments_amount, 
    -- Count all the new posts that aren't ours, unless we aren't logged in.
    COALESCE(SUM((${firebase_id} IS NOT NULL AND thread_posts.is_new AND NOT thread_posts.is_own)::int)::int, 0) as new_posts
FROM threads
LEFT JOIN thread_posts
    ON threads.id = thread_posts.parent_thread_id
WHERE threads.string_id = ${thread_string_id}
GROUP BY threads.id