SELECT 
    posts.string_id as post_id,
    threads.string_id as parent_thread_id,
    parent.string_id as parent_post_id,
    boards.slug as parent_board_slug,
    boards.string_id as parent_board_id,
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
    TO_CHAR(posts.created, 'YYYY-MM-DD"T"HH24:MI:SS.00"Z"') as created_at,
    posts.content,
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
    -- Count all the new comments that aren't ours, unless we aren't logged in.
    COALESCE(
        COUNT(*) FILTER (WHERE
            ${firebase_id} IS NOT NULL AND 
            -- happened after our last visit
            thread_cutoff_time IS NULL OR thread_cutoff_time < comments.created AND
            -- is not own
            comments.author != (SELECT id FROM users WHERE firebase_id = ${firebase_id})), 0)::int as new_comments_amount,
    COALESCE(COUNT(*), 0)::int as total_comments_amount,
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
LEFT JOIN comments
    ON comments.parent_thread = threads.id
LEFT JOIN boards
    ON boards.id= threads.parent_board 
LEFT JOIN thread_identities
    ON thread_identities.user_id = posts.author AND threads.id = thread_identities.thread_id
LEFT JOIN thread_notification_dismissals tnd
    ON tnd.thread_id = threads.id AND ${firebase_id} IS NOT NULL AND tnd.user_id = (SELECT id FROM users WHERE firebase_id = ${firebase_id})
WHERE posts.string_id = ${post_string_id}
GROUP BY 
    posts.id,
    posts.string_id,
    threads.string_id,
    parent.string_id,
    boards.slug,
    boards.string_id,
    posts.author,
    thread_identities.username,
    thread_identities.user_avatar,
    thread_identities.secret_identity_name,
    thread_identities.secret_identity_avatar,
    thread_identities.accessory_avatar,
    posts.created,
    posts.content,
    posts.type,
    tnd.thread_cutoff_time
;