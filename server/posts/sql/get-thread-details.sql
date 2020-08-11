SELECT 
    users.id as user_id,
    users.username,
    users.avatar_reference_id as user_avatar,
    identity_id as secret_identity_id,
    secret_identities.display_name as secret_identity_name,
    secret_identities.avatar_reference_id as secret_identity_avatar,
    threads.id as thread_id,
    threads.string_id as thread_string_id,
    posts.id as post_id,
    comments.id as comment_id
FROM users
CROSS JOIN threads
LEFT JOIN posts
    ON posts.parent_thread = threads.id
LEFT JOIN comments
    ON comments.parent_thread = threads.id AND comments.string_id = ${parent_comment_string_id}
LEFT JOIN user_thread_identities as uti
    ON uti.thread_id = threads.id AND uti.user_id = users.id
LEFT JOIN secret_identities 
    ON secret_identities.id = uti.identity_id
WHERE posts.string_id = ${post_string_id} AND firebase_id = ${firebase_id}