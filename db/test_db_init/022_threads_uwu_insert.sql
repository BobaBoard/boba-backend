
WITH
  new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
      VALUES (
        '4d8471e5-a066-419c-96e4-456c95ade41d',
        (SELECT id FROM boards WHERE slug = 'MODS'))
     RETURNING id),
  posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
      VALUES
        ('60b19785-4eb6-404d-8575-133b8e752513',
         NULL,
         (SELECT id FROM new_thread_id),
         (SELECT id FROM Users WHERE username = 'bobatan'),
         '[{"insert":"Help???????"}]', 
         'text', 
         ARRAY['pls......'], 
         'strangers',
         to_timestamp('2022-04-24 05:42:00', 'YYYY-MM-DD HH:MI:SS'))
     RETURNING id)
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'bobatan'),
      (SELECT id FROM secret_identities WHERE display_name = 'Blue Screen of Desu'));