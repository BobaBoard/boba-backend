CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO Boards(title, slug, description, settings)
VALUES
    ('Main Street, Bobaland.', 'main_street', 'The main board. Keep it safe.', '{}'),
    ('Gore Central', 'gore', 'Everything the light touches is dead doves.', '{}'),
    ('Videogames', 'vg', 'Random videogame discussions. Tag your NSFW.', '{}');
  
INSERT INTO Users(firebase_id, username, invited_by)
VALUES
    ('fb1', 'bobatan', NULL);

INSERT INTO Users(firebase_id, username, invited_by)
VALUES
    ('fb2', 'jersey_devil_69', (SELECT id FROM users WHERE username = 'bobatan')),
    ('fb3', 'oncest5evah', (SELECT id FROM users WHERE username = 'bobatan'));


INSERT INTO secret_identities(display_name)
VALUES
    ('Sunglasses Raccoon'), 
    ('Solid Ocelot'), 
    ('Evil Moth');

WITH
  new_thread_id AS
    (INSERT INTO threads(parent_board,title) VALUES ((SELECT id FROM boards WHERE slug = 'gore'), 'Favorite character to maim?') RETURNING id),
  posts_insert AS 
    (INSERT INTO posts(string_id, parent_thread, author, content, type, whisper_tags, anonymity_type)
      VALUES
        (uuid_generate_v4(), 
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'bobatan'),
        '[{"insert":"Revolver Ocelot"}]', 
        'text', 
        ARRAY['fight me on this'], 
        'strangers'),
        (uuid_generate_v4(), 
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'oncest5evah'),
        '[{"insert":"Kermit the Frog"}]', 
        'text', 
        ARRAY['Im too ashamed to admit this ok', 'sorry mom', 'YOU WILL NEVER KNOW WHO I AM'], 
        'everyone'))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'bobatan'),
      (SELECT id FROM secret_identities WHERE display_name = 'Sunglasses Raccoon')),
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'oncest5evah'),
      (SELECT id FROM secret_identities WHERE display_name = 'Evil Moth'));