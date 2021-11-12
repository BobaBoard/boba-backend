INSERT INTO board_restrictions(board_id, logged_out_restrictions, logged_in_base_restrictions) VALUES 
    ((SELECT id FROM boards WHERE slug='restricted'),
     ARRAY['lock_access'::restriction_type],
     DEFAULT),
    ((SELECT id FROM boards WHERE slug='delisted'),
     ARRAY['delist'::restriction_type],
     ARRAY['delist'::restriction_type]);

INSERT INTO board_description_sections (string_id, board_id, title, description, type, index) VALUES 
    ('cea3f9d1-c911-4fa0-ab69-567a1284374a', 
     (SELECT id FROM boards WHERE slug='restricted'),
     'Logged out users shouldn''t see this!',
     '[{"insert": "pls b secretive"}]',
     'text',
     1)
