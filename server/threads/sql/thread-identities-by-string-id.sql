SELECT
    user_id as id,
    username,
    users.avatar_reference_id as user_avatar_reference_id,
    COALESCE(display_name, roles.name) as display_name,
    COALESCE(secret_identities.avatar_reference_id, roles.avatar_reference_id) as secret_identity_avatar_reference_id,
    is_friend.friend,
    users.firebase_id = ${firebase_id} as self
FROM user_thread_identities AS uti 
    LEFT JOIN users ON uti.user_id = users.id 
    LEFT JOIN secret_identities ON secret_identities.id = uti.identity_id
    LEFT JOIN roles ON roles.id = uti.role_id 
    LEFT JOIN threads ON threads.id = uti.thread_id
    LEFT JOIN LATERAL (
        SELECT true as friend 
        FROM friends 
        WHERE friends.user_id = (SELECT id FROM users WHERE users.firebase_id = ${firebase_id}) 
        AND friends.friend_id = users.id 
        LIMIT 1) as is_friend ON 1=1 
WHERE threads.string_id = ${thread_string_id}