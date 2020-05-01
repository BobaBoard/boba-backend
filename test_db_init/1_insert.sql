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
    (INSERT INTO threads(string_id,parent_board,title)
      VALUES (
        '29d1b2da-3289-454a-9089-2ed47db4967b',
        (SELECT id FROM boards WHERE slug = 'gore'), 
        'Favorite character to maim?')
      RETURNING id),
  posts_insert AS 
    (INSERT INTO posts(string_id, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
      VALUES
        (uuid_generate_v4(), 
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'bobatan'),
        '[{"insert":"Revolver Ocelot"}]', 
        'text', 
        ARRAY['fight me on this'], 
        'strangers',
        now()),
        (uuid_generate_v4(), 
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'oncest5evah'),
        '[{"insert":"Kermit the Frog"}]', 
        'text', 
        ARRAY['Im too ashamed to admit this ok', 'sorry mom', 'YOU WILL NEVER KNOW WHO I AM'], 
        'everyone',
        now() + INTERVAL'5 minute')
      RETURNING id),
  comments_insert AS
    (INSERT INTO comments(string_id, parent_post, author, created, content, anonymity_type)
      VALUES (
        uuid_generate_v4(),
        (SELECT id FROM posts_insert ORDER BY id DESC LIMIT 1),
        (SELECT id FROM Users WHERE username = 'bobatan'),
        now() + INTERVAL'10 minute',
        '[{"insert":"OMG ME TOO"}]', 
        'strangers'
      ),
      (
        uuid_generate_v4(),
        (SELECT id FROM posts_insert ORDER BY id DESC LIMIT 1),
        (SELECT id FROM Users WHERE username = 'bobatan'),
        now() + INTERVAL'10 minute',
        '[{"insert":"friends!!!!!"}]', 
        'strangers'
      ))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'bobatan'),
      (SELECT id FROM secret_identities WHERE display_name = 'Sunglasses Raccoon')),
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'oncest5evah'),
      (SELECT id FROM secret_identities WHERE display_name = 'Evil Moth'));

WITH
  new_thread_id AS
    (INSERT INTO threads(string_id,parent_board,title)
      VALUES (
        'a5c903df-35e8-43b2-a41a-208c43154671',
        (SELECT id FROM boards WHERE slug = 'gore'), 
        'Favorite murder scene in videogames?')
     RETURNING id),
  posts_insert AS 
    (INSERT INTO posts(string_id, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
      VALUES
        (uuid_generate_v4(), 
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'oncest5evah'),
        '[{"insert":"Everything in The Evil Within tbh"}]', 
        'text', 
        ARRAY['joseph oda is love', 'joseph oda is life'], 
        'strangers',
        now()),
        (uuid_generate_v4(), 
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"(chants) Leon Kennedy! Leon Kennedy! Leon Kennedy!)"}]', 
        'text', 
        ARRAY['nothing beats a himbo getting gangbanged by a herd of hungry hungry zombies'], 
        'strangers',
        now() + INTERVAL'5 minute'))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'oncest5evah'),
      (SELECT id FROM secret_identities WHERE display_name = 'Solid Ocelot')),
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
      (SELECT id FROM secret_identities WHERE display_name = 'Sunglasses Raccoon'));