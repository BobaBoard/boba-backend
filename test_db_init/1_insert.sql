CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO Boards(slug, tagline, avatar_reference_id, settings)
VALUES
    ('main_street', 'For BobaBoard-related discussions.', 'villains.png', '{ "accentColor": "#ff5252" }'),
    ('gore', 'Blood! Blood! Blood!', 'gore.png', '{ "accentColor": "#f96680" }'),
    ('anime', 'I wish I had a funny one for this.', 'anime.png', '{ "accentColor": "#24d282"}'),
    ('long', 'A board to test with many posts.', 'onceler-board.png', '{ "accentColor": "#00b8ff"}'),
    ('memes', 'A board to test collections view.', 'kink-meme.png', '{ "accentColor": "#7b00ff"}');

INSERT INTO public.board_description_sections (string_id, board_id,title,description,"type","index") VALUES 
('id1', 2,'Gore Categories',NULL,'category_filter',2),('id2', 2,'Gore description','[{"insert": "pls b nice"}]','text',1)
;
INSERT INTO public.categories (category) VALUES 
('blood')
,('bruises')
;
INSERT INTO public.board_description_section_categories (section_id,category_id) VALUES 
(1,1)
,(1,2)
;
INSERT INTO Users(firebase_id, username, avatar_reference_id, invited_by)
VALUES
    ('c6HimTlg2RhVH3fC1psXZORdLcx2', 'bobatan', 'bobatan.png', NULL);

INSERT INTO Users(firebase_id, username, avatar_reference_id, invited_by)
VALUES
    ('fb2', 'jersey_devil_69', 'hannibal.png', (SELECT id FROM users WHERE username = 'bobatan')),
    ('fb3', 'oncest5evah', 'greedler.jpg', (SELECT id FROM users WHERE username = 'bobatan'));

INSERT INTO Users(firebase_id, username, avatar_reference_id, invited_by)
VALUES
    ('fb4', 'SexyDaddy69', 'mamoru.png', (SELECT id FROM users WHERE username='oncest5evah')),
    ('fb5', 'The Zodiac Killer', 'villains.png', (SELECT id FROM users WHERE username='oncest5evah'));

INSERT INTO secret_identities(display_name, avatar_reference_id)
VALUES
    ('Old Time-y Anon', 'https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png'), 
    ('DragonFucker', 'https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg'), 
    ('Outdated Meme', 'outdated-meme.png');

INSERT INTO friends(user_id, friend_id)
VALUES
    (1, 2),
    (2, 1);

WITH
  new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
      VALUES (
        '29d1b2da-3289-454a-9089-2ed47db4967b',
        (SELECT id FROM boards WHERE slug = 'gore'))
      RETURNING id),
  posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
      VALUES
        ('11b85dac-e122-40e0-b09a-8829c5e0250e',
         NULL,
         (SELECT id FROM new_thread_id),
         (SELECT id FROM Users WHERE username = 'oncest5evah'),
         '[{"insert":"Favorite character to maim?"}]', 
         'text', 
         NULL, 
         'strangers',
         to_timestamp('2020-04-30 03:23:00', 'YYYY-MM-DD HH:MI:SS')),
        ('619adf62-833f-4bea-b591-03e807338a8e', 
         1,
         (SELECT id FROM new_thread_id),
         (SELECT id FROM Users WHERE username = 'bobatan'),
         '[{"insert":"Revolver Ocelot"}]', 
         'text', 
         ARRAY['fight me on this'], 
         'strangers',
         to_timestamp('2020-05-01 05:42:00', 'YYYY-MM-DD HH:MI:SS')),
        ('b95bb260-eae0-456c-a5d0-8ae9e52608d8', 
         1,
         (SELECT id FROM new_thread_id),
         (SELECT id FROM Users WHERE username = 'oncest5evah'),
         '[{"insert":"Kermit the Frog"}]', 
         'text', 
         ARRAY['Im too ashamed to admit this ok', 'sorry mom', 'YOU WILL NEVER KNOW WHO I AM'], 
         'everyone',
         to_timestamp('2020-05-02 06:04:00', 'YYYY-MM-DD HH:MI:SS'))
      RETURNING id),
  comments_insert1 AS
    (INSERT INTO comments(string_id, parent_post, parent_thread, author, created, content, anonymity_type, chain_parent_comment)
      VALUES (
        '46a16199-33d1-48c2-bb79-4d4095014688',
        (SELECT id FROM posts_insert ORDER BY id DESC LIMIT 1),
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'bobatan'),
        to_timestamp('2020-05-22 12:22:00', 'YYYY-MM-DD HH:MI:SS'),
        '[{"insert":"OMG ME TOO"}]', 
        'strangers',
        NULL
      ) RETURNING id),
  comments_insert2 AS
    (INSERT INTO comments(string_id, parent_post, parent_thread, author, created, content, anonymity_type, chain_parent_comment)
      VALUES (
        '89fc3682-cb74-43f9-9a63-bd97d0f59bb9',
        (SELECT id FROM posts_insert ORDER BY id DESC LIMIT 1),
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'bobatan'),
        to_timestamp('2020-05-23 05:42:00', 'YYYY-MM-DD HH:MI:SS') + INTERVAL'10 minute',
        '[{"insert":"friends!!!!!"}]', 
        'strangers',
        (SELECT id FROM comments_insert1 LIMIT 1)
      ))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'bobatan'),
      (SELECT id FROM secret_identities WHERE display_name = 'Old Time-y Anon')),
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'oncest5evah'),
      (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
  new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
      VALUES (
        'a5c903df-35e8-43b2-a41a-208c43154671',
        (SELECT id FROM boards WHERE slug = 'gore'))
     RETURNING id),
  posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
      VALUES
        ('3db477e0-57ed-491d-ba11-b3a0110b59b0',
         NULL,
         (SELECT id FROM new_thread_id),
         (SELECT id FROM Users WHERE username = 'bobatan'),
         '[{"insert":"Favorite murder scene in videogames?"}]', 
         'text', 
         ARRAY['mwehehehehe'], 
         'strangers',
         to_timestamp('2020-04-24 05:42:00', 'YYYY-MM-DD HH:MI:SS')),
        ('08f25ef1-82dc-4202-a410-c0723ef76789', 
         4,
         (SELECT id FROM new_thread_id),
         (SELECT id FROM Users WHERE username = 'oncest5evah'),
         '[{"insert":"Everything in The Evil Within tbh"}]', 
         'text', 
         ARRAY['joseph oda is love', 'joseph oda is life'], 
         'strangers',
         to_timestamp('2020-04-30 08:22:00', 'YYYY-MM-DD HH:MI:SS')),
        ('1f1ad4fa-f02a-48c0-a78a-51221a7db170', 
         4,
         (SELECT id FROM new_thread_id),
         (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
         '[{"insert":"(chants) Leon Kennedy! Leon Kennedy! Leon Kennedy!)"}]', 
         'text', 
         ARRAY['nothing beats a himbo getting gangbanged by a herd of hungry hungry zombies'], 
         'strangers',
         to_timestamp('2020-05-03 9:42:00', 'YYYY-MM-DD HH:MI:SS') + INTERVAL'5 minute'))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'oncest5evah'),
      (SELECT id FROM secret_identities WHERE display_name = 'Outdated Meme')),
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
      (SELECT id FROM secret_identities WHERE display_name = 'Old Time-y Anon')),
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'bobatan'),
      (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
  new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
      VALUES (
        'b27710a8-0a9f-4c09-b3a5-54668bab7051',
        (SELECT id FROM boards WHERE slug = 'anime'))
     RETURNING id),
  posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
      VALUES
        ('987f795b-d60d-4016-af82-8684411f7785',
         NULL,
         (SELECT id FROM new_thread_id),
         (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
         '[{"insert":"Stuff will be inserted here!"}]', 
         'text', 
         ARRAY['this is a test post'], 
         'strangers',
         to_timestamp('2020-04-24 05:42:00', 'YYYY-MM-DD HH:MI:SS'))
     RETURNING id),
  comments_insert1 AS
    (INSERT INTO comments(string_id, parent_post, parent_thread, author, created, content, anonymity_type)
      VALUES (
        '21b16199-33d1-48c2-bb79-4d4095014avd',
        (SELECT id FROM posts_insert ORDER BY id DESC LIMIT 1),
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        to_timestamp('2020-04-24 05:43:00', 'YYYY-MM-DD HH:MI:SS'),
        '[{"insert":"This is an example of a question?"}]', 
        'strangers'
      ) RETURNING id),
  comments_insert2 AS
    (INSERT INTO comments(string_id, parent_post, parent_thread, author, created, content, anonymity_type, parent_comment)
      VALUES (
        'ad3c3682-cb74-43f9-9a63-bd97d0f59z87',
        (SELECT id FROM posts_insert ORDER BY id DESC LIMIT 1),
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        to_timestamp('2020-04-24 05:44:00', 'YYYY-MM-DD HH:MI:SS'),
        '[{"insert":"And this is an example of an answer!!!!!"}]', 
        'strangers',
        (SELECT id FROM comments_insert1 LIMIT 1)
      ))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
      (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

INSERT INTO friends(user_id,friend_id) VALUES (1,3),(3,1);

INSERT INTO tags(tag)  VALUES
  ('good'),
  ('evil'),
  ('oddly specific'),
  ('metal gear'),
  ('bobapost');

INSERT INTO post_tags(post_id, tag_id) VALUES
 (1,2), -- 'Favorite character to maim?' is `evil` 
 (2,2), -- 'Revolver Ocelot?' is `evil` 
 (2,3), -- 'Revolver Ocelot?' is `oddly specific` 
 (2,4), -- 'Revolver Ocelot?' is `metal gear` 
 (3,1), -- 'Kermit the Frog?' is `good` 
 (3,3), -- 'Kermit the Frog?' is `oddly specific` 
 
 (1,5), -- 'Favorite Character to maim' is `bobapost`
 (2,5), -- 'Revolver Ocelot?' is `bobapost`
 (3,5); -- 'Kermit the Frog?' is `bobapost`

INSERT INTO content_warnings(warning) VALUES
  ('gore'),
  ('guns');

INSERT INTO post_warnings(post_id, warning_id) VALUES
  (1,1), -- 'Favorite character to maim?' has 'gore'
  (2,2); -- 'Revolver Ocelot?' has 'guns'
