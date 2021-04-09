CREATE VIEW thread_identities AS (
    SELECT
        uti.thread_id as thread_id,
        uti.user_id as user_id,
        users.username as username,
        users.avatar_reference_id as user_avatar,
        COALESCE(secret_identities.display_name, roles.name) as secret_identity_name,
        COALESCE(secret_identities.avatar_reference_id, roles.avatar_reference_id) as secret_identity_avatar,
        roles.color as secret_identity_color,
        accessories.image_reference_id as accessory_avatar
        FROM user_thread_identities AS uti 
    INNER JOIN users 
        ON uti.user_id = users.id 
    LEFT JOIN secret_identities 
        ON secret_identities.id = uti.identity_id
    LEFT JOIN roles
        ON roles.id = uti.role_id
    LEFT JOIN role_accessories ra
        ON roles.id = ra.role_id
    LEFT JOIN identity_thread_accessories ita
        ON ita.thread_id = uti.thread_id AND (
            (secret_identities.id IS NOT NULL AND secret_identities.id = ita.identity_id) OR 
            (roles.id IS NOT NULL AND roles.id = ita.role_id))
    LEFT JOIN LATERAL (
            SELECT * FROM accessories
            WHERE ita.accessory_id = accessories.id OR ra.accessory_id = accessories.id
            LIMIT 1) accessories 
        ON 1 = 1
);