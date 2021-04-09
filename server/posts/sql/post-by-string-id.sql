WITH
    thread_comments AS
        (SELECT 
            thread_comments.parent_post,
            -- Count all the new comments that aren't ours, unless we aren't logged in.
            COALESCE(SUM((${firebase_id} IS NOT NULL AND is_new AND NOT is_own)::int), 0) as new_comments,
            COALESCE(COUNT(*), 0) as total_comments,
            json_agg(json_build_object(
                'comment_id', thread_comments.string_id,
                'parent_post', thread_comments.parent_thread_string_id,
                'parent_comment', (SELECT string_id FROM comments WHERE comments.id = thread_comments.parent_comment),
                'chain_parent_id', (SELECT string_id FROM comments WHERE comments.id = thread_comments.chain_parent_comment),
                'author', thread_comments.author,
                'username', thread_comments.username,
                'user_avatar', thread_comments.user_avatar,
                'secret_identity_name', thread_comments.secret_identity_name,
                'secret_identity_avatar', thread_comments.secret_identity_avatar,
                'accessory_avatar', thread_comments.accessory_avatar,
                'content', thread_comments.content,
                'created',  TO_CHAR(thread_comments.created, 'YYYY-MM-DD"T"HH24:MI:SS'),
                'anonymity_type', thread_comments.anonymity_type,
                'self', thread_comments.is_own,
                'friend', thread_comments.is_friend,
                'is_new', (is_new AND NOT is_own),
                'is_own', is_own
            ) ORDER BY thread_comments.created ASC) as comments 
         FROM (
            SELECT 
                comments.*,
                thread_identities.*,
                ${firebase_id} IS NOT NULL AND comments.author = (SELECT id FROM users WHERE firebase_id = ${firebase_id}) as is_own,
                ${firebase_id} IS NOT NULL AND comments.author = ANY(
                    SELECT friend_id 
                    FROM users 
                    LEFT JOIN friends 
                        ON users.id = friends.user_id 
                    WHERE firebase_id = ${firebase_id}
                ) as is_friend,
                ${firebase_id} IS NOT NULL AND (thread_cutoff_time IS NULL OR thread_cutoff_time < comments.created) as is_new,
                threads.string_id as parent_thread_string_id,
                tnd.thread_cutoff_time
            FROM comments 
            LEFT JOIN posts
                ON comments.parent_post = posts.id
            LEFT JOIN threads
                ON COMMENTS.parent_thread = threads.id 
            LEFT JOIN thread_identities
                ON thread_identities.user_id = comments.author AND threads.id = thread_identities.thread_id 
            LEFT JOIN thread_notification_dismissals tnd
                ON tnd.thread_id = threads.id AND ${firebase_id} IS NOT NULL AND tnd.user_id = (SELECT id FROM users WHERE firebase_id = ${firebase_id})
            WHERE posts.string_id = ${post_string_id}) as thread_comments
         GROUP BY thread_comments.parent_post)
SELECT 
    posts.string_id as post_id,
    threads.string_id as parent_thread_id,
    parent.string_id as parent_post_id,
    boards.slug as parent_board_slug,
    posts.author,
    thread_identities.username,
    thread_identities.user_avatar,
    thread_identities.secret_identity_name,
    thread_identities.secret_identity_avatar,
    thread_identities.accessory_avatar,
    ${firebase_id} IS NOT NULL AND posts.author = (SELECT id FROM users WHERE firebase_id = ${firebase_id}) as self,
    ${firebase_id} IS NOT NULL AND posts.author = ANY(
        SELECT friend_id 
        FROM users 
        LEFT JOIN friends 
            ON users.id = friends.user_id 
        WHERE firebase_id = ${firebase_id}
    ) as friend,
    TO_CHAR(posts.created, 'YYYY-MM-DD"T"HH24:MI:SS') as created,
    posts.content,
    posts.options,
    posts.type,
    array(
        SELECT tag FROM post_tags 
        LEFT JOIN tags
        ON post_tags.tag_id = tags.id WHERE post_tags.post_id = posts.id) as index_tags,
    array(
        SELECT category FROM post_categories 
        LEFT JOIN categories
        ON post_categories.category_id = categories.id WHERE post_categories.post_id = posts.id) as category_tags,
    array(
        SELECT warning FROM post_warnings 
        LEFT JOIN content_warnings
        ON post_warnings.warning_id = content_warnings.id WHERE post_warnings.post_id = posts.id) as content_warnings,
    COALESCE(posts.whisper_tags, ARRAY[]::text[]) as whisper_tags,
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
        WHEN thread_cutoff_time IS NULL OR thread_cutoff_time < posts.created THEN TRUE 
        ELSE FALSE
    END as is_new
FROM posts               
LEFT JOIN posts as parent
    ON posts.parent_post = parent.id
LEFT JOIN threads
    ON posts.parent_thread = threads.id
LEFT JOIN boards
    ON boards.id= threads.parent_board 
LEFT JOIN thread_identities
    ON thread_identities.user_id = posts.author AND threads.id = thread_identities.thread_id 
LEFT JOIN thread_comments 
    ON posts.id = thread_comments.parent_post
LEFT JOIN thread_notification_dismissals tnd
    ON tnd.thread_id = threads.id AND ${firebase_id} IS NOT NULL AND tnd.user_id = (SELECT id FROM users WHERE firebase_id = ${firebase_id})
WHERE posts.string_id = ${post_string_id};