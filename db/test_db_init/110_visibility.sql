INSERT INTO board_restrictions(board_id, logged_out_restrictions, logged_in_base_restrictions) VALUES 
    ((SELECT id FROM boards WHERE slug='restricted'),
     ARRAY['lock_access'::restriction_type],
     DEFAULT),
    ((SELECT id FROM boards WHERE slug='delisted'),
     ARRAY['delist'::restriction_type],
     ARRAY['delist'::restriction_type]);

INSERT INTO board_description_sections (string_id, board_id, title, description, type, index) VALUES 
    ('id1', 
     (SELECT id FROM boards WHERE slug='restricted'),
     'Logged out users shouldn''t see this!',
     '[{"insert": "pls b secretive"}]',
     'text',
     1)
