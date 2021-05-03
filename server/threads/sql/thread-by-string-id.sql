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
                'secret_identity_color', thread_comments.secret_identity_color,
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
            LEFT JOIN threads
                ON comments.parent_thread = threads.id
            LEFT JOIN thread_identities
                ON thread_identities.user_id = comments.author AND threads.id = thread_identities.thread_id 
            LEFT JOIN thread_notification_dismissals tnd
               ON tnd.thread_id = threads.id AND ${firebase_id} IS NOT NULL AND tnd.user_id = (SELECT id FROM users WHERE firebase_id = ${firebase_id})
            WHERE threads.string_id = ${thread_string_id}) as thread_comments
         GROUP BY thread_comments.parent_post),
    thread_posts AS
        (SELECT 
            posts.string_id as post_id,
            threads.string_id as parent_thread_id,
            parent.string_id as parent_post_id,
            posts.author,
            thread_identities.username,
            thread_identities.user_avatar,
            thread_identities.secret_identity_name,
            thread_identities.secret_identity_avatar,
            thread_identities.secret_identity_color,
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
         LEFT JOIN thread_identities
            ON thread_identities.user_id = posts.author AND threads.id = thread_identities.thread_id 
         LEFT JOIN thread_comments 
            ON posts.id = thread_comments.parent_post
         LEFT JOIN thread_notification_dismissals tnd
            ON tnd.thread_id = threads.id AND ${firebase_id} IS NOT NULL AND tnd.user_id = (SELECT id FROM users WHERE firebase_id = ${firebase_id})
         WHERE threads.string_id = ${thread_string_id})
SELECT 
    threads.string_id as thread_id, 
    boards.slug as board_slug,
    json_agg(row_to_json(thread_posts) ORDER BY thread_posts.created ASC) as posts,
    COALESCE(threads.OPTIONS ->> 'default_view', 'thread')::view_types AS default_view,
    COALESCE(SUM(thread_posts.new_comments_amount)::int, 0) as thread_new_comments_amount,
    COALESCE(SUM(thread_posts.total_comments_amount)::int, 0) as thread_total_comments_amount, 
    -- Get all the posts that are direct answers to the first one
    COALESCE((SELECT COUNT(post_id) FROM thread_posts WHERE parent_post_id = (SELECT post_id FROM thread_posts WHERE parent_post_id IS null))::int, 0) as thread_direct_threads_amount,
    -- Count all the new posts that aren't ours, unless we aren't logged in.
    COALESCE(SUM((${firebase_id} IS NOT NULL AND thread_posts.is_new AND NOT thread_posts.is_own)::int)::int, 0) as thread_new_posts_amount,
    COALESCE(COUNT(thread_posts.*)::int, 0) as thread_total_posts_amount,
    uht.user_id IS NOT NULL as hidden,
    umt.user_id IS NOT NULL as muted
FROM threads
LEFT JOIN thread_posts
    ON threads.string_id = thread_posts.parent_thread_id
LEFT JOIN boards
    ON threads.parent_board = boards.id
LEFT JOIN user_muted_threads umt
    ON  ${firebase_id} IS NOT NULL AND umt.user_id = (SELECT id FROM users WHERE firebase_id = ${firebase_id}) AND umt.thread_id = threads.id
LEFT JOIN user_hidden_threads uht
    ON  ${firebase_id} IS NOT NULL AND uht.user_id = (SELECT id FROM users WHERE firebase_id = ${firebase_id}) AND uht.thread_id = threads.id
WHERE threads.string_id = ${thread_string_id}
GROUP BY threads.id, boards.slug, uht.user_id, umt.user_id