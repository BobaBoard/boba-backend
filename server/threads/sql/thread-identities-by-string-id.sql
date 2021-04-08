SELECT
    user_id as id,
    username,
    users.avatar_reference_id as user_avatar_reference_id,
    COALESCE(display_name, roles.name) as display_name,
    COALESCE(secret_identities.avatar_reference_id, roles.avatar_reference_id) as secret_identity_avatar_reference_id,
    accessories.image_reference_id as accessory_avatar,
    is_friend.friend,
    users.firebase_id = ${firebase_id} as self
FROM user_thread_identities AS uti 
    LEFT JOIN users ON uti.user_id = users.id 
    LEFT JOIN secret_identities ON secret_identities.id = uti.identity_id
    LEFT JOIN roles ON roles.id = uti.role_id 
    LEFT JOIN role_accessories ra ON roles.id = ra.role_id
    LEFT JOIN threads ON threads.id = uti.thread_id
    LEFT JOIN identity_thread_accessories ita
        ON ita.thread_id = threads.id AND (
            (secret_identities.id IS NOT NULL AND secret_identities.id = ita.identity_id) OR 
            (roles.id IS NOT NULL AND roles.id = ita.role_id))
    LEFT JOIN accessories
        ON ita.accessory_id = accessories.id OR ra.accessory_id = accessories.id
    LEFT JOIN LATERAL (
        SELECT true as friend 
        FROM friends 
        WHERE friends.user_id = (SELECT id FROM users WHERE users.firebase_id = ${firebase_id}) 
        AND friends.friend_id = users.id 
        LIMIT 1) as is_friend ON 1=1 
WHERE threads.string_id = ${thread_string_id}