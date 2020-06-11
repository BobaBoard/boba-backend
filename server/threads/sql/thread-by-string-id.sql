WITH
    last_visited AS
        (SELECT
            last_visit_time
            FROM user_thread_last_visits
            LEFT JOIN users
            ON users.id = user_thread_last_visits.user_id
        LEFT JOIN threads
            ON threads.id = user_thread_last_visits.thread_id
        WHERE users.firebase_id = ${firebase_id} AND threads.string_id = ${thread_string_id}),
    thread_comments AS
        (SELECT 
            thread_comments.parent_post,
            SUM(CASE WHEN last_visit_time IS NULL OR last_visit_time < thread_comments.created THEN 1 ELSE 0 END) as new_comments,
            COUNT(*) as total_comments,
            json_agg(json_build_object(
            'id', thread_comments.string_id,
            'parent_post', thread_comments.parent_thread_string_id,
            'author', thread_comments.author,
            'content', thread_comments.content,
            'created',  TO_CHAR(thread_comments.created, 'YYYY-MM-DD"T"HH24:MI:SS'),
            'anonymity_type', thread_comments.anonymity_type,
            'is_new', last_visit_time < thread_comments.created OR last_visit_time IS NULL
            ) ORDER BY thread_comments.created ASC) as comments 
            FROM (
            SELECT 
                comments.*,
                thread.string_id as parent_thread_string_id,
                last_visited.last_visit_time
            FROM comments 
            LEFT JOIN threads as thread
                ON comments.parent_thread = thread.id
            LEFT JOIN last_visited
                ON 1=1
            WHERE thread.string_id = ${thread_string_id}) as thread_comments
            GROUP BY thread_comments.parent_post),
    thread_posts AS
        (SELECT 
            posts.string_id as id,
            posts.parent_thread as parent_thread_id,
            parent.string_id as parent_post_id,
            posts.author,
            TO_CHAR(posts.created, 'YYYY-MM-DD"T"HH24:MI:SS') as created,
            posts.content,
            posts.type,
            posts.whisper_tags,
            posts.anonymity_type,
            thread_comments.comments,
            thread_comments.total_comments,
            thread_comments.new_comments,
            last_visited.last_visit_time < posts.created OR last_visited.last_visit_time IS NULL as is_new
            FROM posts
            LEFT JOIN posts as parent
            ON posts.parent_post = parent.id
            LEFT JOIN thread_comments 
            ON posts.id = thread_comments.parent_post
            LEFT JOIN last_visited
            ON 1=1
            ORDER BY posts.created DESC)
SELECT 
    threads.string_id, 
    json_agg(row_to_json(thread_posts)) as posts,
    SUM(thread_posts.new_comments) as new_comments,
    SUM(thread_posts.total_comments) as total_comments,
    SUM(CASE WHEN thread_posts.is_new IS NULL OR thread_posts.is_new THEN 1 ELSE 0 END) as new_posts
FROM threads
LEFT JOIN thread_posts
    ON threads.id = thread_posts.parent_thread_id
WHERE threads.string_id = ${thread_string_id}
GROUP BY threads.id