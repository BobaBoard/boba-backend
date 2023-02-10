INSERT INTO board_restrictions(board_id, logged_out_restrictions, logged_in_base_restrictions) VALUES 
    ((SELECT id FROM boards WHERE slug='restricted'),
     ARRAY['lock_access'::board_restrictions_type],
     DEFAULT),
    ((SELECT id FROM boards WHERE slug='delisted'),
     ARRAY['delist'::board_restrictions_type],
     ARRAY['delist'::board_restrictions_type]);

INSERT INTO board_description_sections (string_id, board_id, title, description, type, index) VALUES 
    ('cea3f9d1-c911-4fa0-ab69-567a1284374a', 
     (SELECT id FROM boards WHERE slug='restricted'),
     'Logged out users shouldn''t see this!',
     '[{"insert": "pls b secretive"}]',
     'text',
     1);

WITH
  new_thread_id AS
    (INSERT INTO threads(external_id, parent_board)
      VALUES (
        'b3f4174e-c9e2-4f79-9d22-7232aa48744e',
        (SELECT id FROM boards WHERE slug = 'restricted'))
     RETURNING id),
  posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
      VALUES
        ('d1c0784b-0b72-40d0-801d-eb718b5ad011',
         NULL,
         (SELECT id FROM new_thread_id),
         (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
         '[{"insert":"You can''t see me!"}]', 
         'text', 
         ARRAY['this is a test post'], 
         'strangers',
         to_timestamp('2020-04-24 05:42:00', 'YYYY-MM-DD HH:MI:SS'))
     RETURNING id),
  comments_insert1 AS
    (INSERT INTO comments(string_id, parent_post, parent_thread, author, created, content, anonymity_type)
      VALUES (
        '9c0300d9-b9f5-4dcf-874b-754b5f4e8ba9',
        (SELECT id FROM posts_insert ORDER BY id DESC LIMIT 1),
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        to_timestamp('2020-04-24 05:44:00', 'YYYY-MM-DD HH:MI:SS'),
        '[{"insert":"MWAHAHAHAHAHAHHAHAHAHAHAHHAHAH!!!!!"}]', 
        'strangers')
      )
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
      (SELECT id FROM secret_identities WHERE display_name = 'The OG OG Komaeda'));