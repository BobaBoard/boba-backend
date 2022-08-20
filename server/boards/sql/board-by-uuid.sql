WITH 
  logged_in_user AS
    (SELECT id FROM users WHERE users.firebase_id = ${firebase_id}),
  ordered_pinned_boards AS
    (SELECT row_number() OVER(ORDER BY id) AS index, board_id, user_id FROM user_pinned_boards)
SELECT 
    boards.string_id,
    boards.slug,
    boards.tagline,
    boards.avatar_reference_id as avatar_url,
    boards.settings,
    realms.string_id as realm_string_id,
    COALESCE(json_agg(DISTINCT jsonb_build_object(
        'id', bds.string_id,
        'index', bds.index, 
        'title', bds.title,
        'description', bds.description,
        'type', bds.type,
        'categories', (
            SELECT json_agg(categories.category) FILTER (WHERE categories.category IS NOT NULL) 
            FROM board_description_sections 
                LEFT JOIN board_description_section_categories bdsc ON bds.id = bdsc.section_id
                LEFT JOIN categories ON bdsc.category_id = categories.id 
            WHERE board_description_sections.id = bds.id
            GROUP BY bds.id ))) FILTER (WHERE bds.id IS NOT NULL), '[]') as descriptions,
    umb.user_id IS NOT NULL as muted,
    COALESCE(opb.index::int, NULL) as pinned_order,
    COALESCE(
        json_agg(DISTINCT jsonb_build_object(
            'id', p.role_id,
            'avatar_url', p.avatar_reference_id,
            'accessory', p.role_accessory,
            'color', p.role_color,
            'name', p.role_name
        )) FILTER (WHERE p.permissions = 'post_as_role' OR p.permissions = 'all'), '[]') AS posting_identities,
    COALESCE(
        json_agg(DISTINCT jsonb_build_object(
            'id', accessories.string_id,
            'name', COALESCE(accessories.name, 'Unknown'),
            'accessory', accessories.image_reference_id
        )) FILTER (WHERE accessories.id IS NOT NULL), '[]') as accessories,
    COALESCE(
        json_agg(DISTINCT p.permissions) 
            FILTER (WHERE p.permissions IS NOT NULL AND p.permissions != 'post_as_role'), '[]') AS permissions,
    to_jsonb(COALESCE(logged_out_restrictions, ARRAY[]::board_restrictions_type[])) as logged_out_restrictions,
    to_jsonb(COALESCE(CASE WHEN logged_in_user.id IS NOT NULL THEN logged_in_base_restrictions ELSE NULL END, ARRAY[]::board_restrictions_type[])) as logged_in_base_restrictions
FROM boards 
    LEFT JOIN threads 
        ON boards.id = threads.parent_board
    LEFT JOIN user_muted_boards umb 
        ON boards.id = umb.board_id AND umb.user_id = (SELECT id FROM logged_in_user LIMIT 1)
    LEFT JOIN ordered_pinned_boards opb 
        ON boards.id = opb.board_id AND opb.user_id = (SELECT id FROM logged_in_user LIMIT 1)
    LEFT JOIN board_user_roles bur 
        ON boards.id = bur.board_id AND bur.user_id = (SELECT id FROM logged_in_user LIMIT 1)
    LEFT JOIN realm_user_roles rur
        ON rur.user_id = (SELECT id FROM logged_in_user LIMIT 1)
    LEFT JOIN realm_accessories
        ON TRUE 
    LEFT JOIN accessories
        ON realm_accessories.accessory_id = accessories.id
    LEFT JOIN LATERAL (
            SELECT 
                roles.string_id AS role_id, 
                avatar_reference_id AS avatar_reference_id,
                color AS role_color,
                accessories.image_reference_id AS role_accessory,
                roles.name AS role_name, 
                UNNEST(roles.permissions) AS permissions 
            FROM roles 
            LEFT JOIN role_accessories ra
            ON roles.id = ra.role_id
            LEFT JOIN accessories
                ON ra.accessory_id = accessories.id
            WHERE bur.role_id = roles.id OR rur.role_id = roles.id) AS p 
        ON 1=1
    LEFT JOIN board_description_sections bds 
        ON bds.board_id = boards.id     
    LEFT JOIN board_restrictions br
        ON boards.id = br.board_id
    LEFT JOIN logged_in_user
        ON 1=1
    LEFT JOIN realms
        ON boards.parent_realm_id = realms.id
WHERE boards.string_id=${board_uuid}
GROUP BY boards.id, umb.user_id, opb.index, br.logged_out_restrictions, br.logged_in_base_restrictions, logged_in_user.id
