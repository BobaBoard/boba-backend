SELECT 
    users.id as user_id,
    identity_id,
    threads.id as thread_id,
    posts.id as post_id
FROM users
CROSS JOIN threads
LEFT JOIN posts
    ON posts.parent_thread = threads.id
LEFT JOIN user_thread_identities as uti
    ON uti.thread_id = threads.id AND uti.user_id = users.id
LEFT JOIN secret_identities 
    ON secret_identities.id = uti.identity_id
WHERE posts.string_id = ${post_string_id} AND firebase_id = ${firebase_id}