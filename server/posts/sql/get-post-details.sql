SELECT 
    users.id as user_id,
    users.username,
    users.avatar_reference_id as user_avatar,
    uti.identity_id as secret_identity_id,
    uti.role_id as role_identity_id,
    COALESCE(secret_identities.display_name, roles.name) as secret_identity_name,
    COALESCE(secret_identities.avatar_reference_id, roles.avatar_reference_id) as secret_identity_avatar,
    roles.color as secret_identity_color,
    accessories.image_reference_id as accessory_avatar,
    threads.id as thread_id,
    threads.external_id as thread_external_id,
    posts.id as post_id,
    comments.id as comment_id,
    boards.slug AS board_slug,
    boards.string_id AS board_external_id
FROM users
CROSS JOIN threads
LEFT JOIN posts
    ON posts.parent_thread = threads.id
LEFT JOIN comments
    ON comments.parent_thread = threads.id AND comments.string_id = ${parent_comment_external_id}
LEFT JOIN user_thread_identities as uti
    ON uti.thread_id = threads.id AND uti.user_id = users.id
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
LEFT JOIN boards
    ON threads.parent_board = boards.id
WHERE posts.string_id = ${post_external_id} AND firebase_id = ${firebase_id}