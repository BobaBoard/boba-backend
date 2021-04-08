INSERT INTO boards(slug, tagline, avatar_reference_id, settings) VALUES
    ('restricted',
     'A board to test for logged-in only view',
     'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2Fe4e263cf-ee98-4902-9c14-c10299210e01.png?alt=media&token=7c170411-9401-4d4e-9f66-5d6dfee2fccd',
     '{ "accentColor": "#234a69"}'),
    ('delisted',
     'A board to test for link-only view',
     'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Fc3b86805-4df7-4b1a-9fa2-b96b5165a636?alt=media&token=7652d44a-38cb-40cc-82ef-908cd4265840',
     '{ "accentColor": "#fa8628"}');

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
