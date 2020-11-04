WITH logged_in_user AS (
        SELECT id FROM users WHERE firebase_id  = ${firebase_id}
    )
SELECT 
    boards.slug,
    boards.tagline,
    boards.avatar_reference_id,
    boards.settings,
    json_agg(DISTINCT jsonb_build_object(
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
            GROUP BY bds.id ))) FILTER (WHERE bds.id IS NOT NULL) as descriptions,
    umb.user_id IS NOT NULL as muted,
    upb.user_id IS NOT NULL as pinned,
    COALESCE(
        json_agg(DISTINCT jsonb_build_object(
            'id', p.role_id,
            'avatar_reference_id', p.avatar_reference_id,
            'name', p.role_name
        )) FILTER (WHERE p.permissions = 'post_as_role' OR p.permissions = 'all'), '[]') AS posting_identities,
    COALESCE(
        json_agg(DISTINCT p.permissions) 
            FILTER (WHERE p.permissions IS NOT NULL AND p.permissions != 'post_as_role'), '[]') AS permissions
FROM boards 
    LEFT JOIN threads 
        ON boards.id = threads.parent_board
    LEFT JOIN user_muted_boards umb 
        ON boards.id = umb.board_id AND umb.user_id = (SELECT id FROM users WHERE users.firebase_id = ${firebase_id})
    LEFT JOIN user_pinned_boards upb 
        ON boards.id = upb.board_id AND upb.user_id = (SELECT id FROM users WHERE users.firebase_id = ${firebase_id})
    LEFT JOIN board_user_roles bur 
        ON boards.id = bur.board_id AND bur.user_id = (SELECT id FROM logged_in_user LIMIT 1)
    LEFT JOIN LATERAL (
            SELECT 
                string_id AS role_id, 
                avatar_reference_id AS avatar_reference_id, 
                name AS role_name, 
                UNNEST(roles.permissions) AS permissions 
            FROM roles WHERE bur.role_id = roles.id) AS p 
        ON 1=1
    LEFT JOIN board_description_sections bds 
        ON bds.board_id = boards.id 
WHERE boards.slug=${board_slug}
GROUP BY boards.id, umb.user_id, upb.user_id