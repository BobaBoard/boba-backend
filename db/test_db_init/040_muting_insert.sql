WITH
  new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
      VALUES (
        '09785026-86fa-44a2-a0b5-22e6c59f01d8',
        (SELECT id FROM boards WHERE slug = 'muted'))
     RETURNING id),
  posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
      VALUES
        ('4ff5460f-da1a-4de4-8bcd-79c79e2f899b',
         NULL,
         (SELECT id FROM new_thread_id),
         (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
         '[{"insert":"Stuff will be inserted here!"}]', 
         'text', 
         ARRAY['this is a test post'], 
         'strangers',
         to_timestamp('2020-01-14 12:42:00', 'YYYY-MM-DD HH:MI:SS'))),
  identities AS
    (INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
        VALUES
        ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker')))
INSERT INTO user_muted_threads(thread_id,user_id) VALUES 
    ((SELECT id FROM new_thread_id),
     (SELECT id FROM Users WHERE username = 'bobatan'));

INSERT INTO user_muted_boards(board_id, user_id) VALUES 
    ((SELECT id FROM boards WHERE slug = 'muted'),
     (SELECT id FROM Users WHERE username = 'jersey_devil_69')),
    ((SELECT id FROM boards WHERE slug = 'ssshh'),
     (SELECT id FROM Users WHERE username = 'bobatan'));
