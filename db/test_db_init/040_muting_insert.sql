
INSERT INTO Boards(string_id, slug, tagline, avatar_reference_id, settings)
VALUES
    ('2bdce2fa-12e0-461b-b0fb-1a2e67227434', 'muted', 'A board to test for muting.', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Feded338a-e0e5-4a97-a368-5ae525c0eec4?alt=media&token=914f84b7-a581-430e-bb09-695f653e8e02', '{ "accentColor": "#9b433b" }');

WITH
  new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
      VALUES (
        'b86710a8-66h7-4c09-b3a5-54668bab7051',
        (SELECT id FROM boards WHERE slug = 'muted'))
     RETURNING id),
  posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
      VALUES
        ('123f795b-d60d-4016-nn56-8684411f7785',
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
