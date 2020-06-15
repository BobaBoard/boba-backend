-- This file inserts many posts in the "long" board, which is used to test
-- methods that need many posts to work (e.g. pagination)
WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '90119d99-359d-4a60-b5ab-9b6077d0dc39',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('f423a2f4-7a8a-4d3d-8858-c1c7602133da',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 1!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-01 05:20:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        'dacfb175-0d47-4c5e-8ecc-7fbf176ad915',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('c137f3e9-8810-4807-9a1d-0ddd27ce52ca',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 2!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-01 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        'd6369940-6415-4de8-b8fd-393cfe3013dd',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('39a02dd0-4955-4276-b659-e673c70b1a2e',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 3!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-02 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        'e26976bf-e61a-4dc3-8c0e-60e16d5d4b31',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('73454eae-6b9d-4e1b-9652-517366f92f2b',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 4!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-03 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '9c60fdd5-0b9c-4e14-bf0d-417f2ab36ff1',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('187bbc83-558a-46fe-aeb4-c146bc5fd6e8',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 5!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-04 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '38ee861a-fec4-4877-a603-f1ff9f96b4c7',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('cfe5c845-23b2-4e24-b5a8-20b5e3a0d7ab',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 6!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-05 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        'bcbde425-7f84-4e68-acd5-65aaae95714c',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('ce00d513-1c45-4248-8124-d18cc2174631',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 7!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-06 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '8d227983-7649-49c9-9fa4-b3c398f4648c',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('ec74bcfd-1660-4f84-8656-89ae52b403d7',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 8!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-07 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '06ba998d-82d8-4e0b-8bbb-a3b3455c4167',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('d3c57555-a40e-4036-a001-e9b6177a4ddc',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 9!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-08 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '72470830-7984-4bf6-a0bf-dc5af7d4779b',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('946f0408-f0a5-4b7e-90ee-a70f6c1e2082',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 10!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-09 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '7006e0dc-7c7b-4cc5-8c08-61362e8d288b',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('7fbb6b0b-eb1d-4cbf-b610-6aaa3dbf50ba',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 11!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-10 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '3e9a317f-2bcd-4db3-abbb-619fa7c03f24',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('e3b05f4d-fda3-4c4e-ab5c-5f0f0afa626d',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 12!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-11 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '1c92ab43-4309-454f-be27-d85d3fd78808',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('77037fd3-3a14-46ce-928c-86ab97c513df',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 13!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-12 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '8d0be581-5cc7-47c1-947c-f8242898682d',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('07fb6be3-b4db-4e44-adaf-4d0d5214fdf8',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 14!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-13 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        'c5004e2b-4358-43df-8078-905b608e9ceb',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('07a31562-c7e5-4026-b268-de758299f924',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 15!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-14 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '78d98a6a-c24b-4b7a-8e06-4a30862afa2d',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('676f0a9a-897e-4194-9020-980cf2ac813f',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 16!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-15 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '7f46031b-cc9d-4729-99f0-fcd8302eea0b',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('95228cfe-02d1-425e-bf1e-4917218dfd2a',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 17!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-16 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '43784970-31f1-4e09-99d6-2b6526b353fe',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('c0af79f8-af24-412c-8e1b-c3dad47bcf68',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 18!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-17 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '32a0174b-091e-4fe6-82f3-bffd6c6026ae',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('bd6efcb5-1b0e-4ebc-bc48-4c9a23b14cdb',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 19!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-18 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '8799b916-0837-4bfb-b972-5e7fb0b3d68b',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('9bbcd916-a17c-47ee-80ca-376eb8f1d3bb',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 20!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-19 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '23e35e53-57dd-4fa2-8911-89276a99af59',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('0480192a-e816-4eb3-b927-50ef2c620fc0',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 21!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-20 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '00174331-d4c5-4254-8178-afbd46f45275',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('8cb16008-1efd-4c5d-a1aa-0b738fcc68c0',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 22!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-21 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '031cd7f4-cbaa-46d0-aaa4-911df0e097b5',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('9adb9e1b-2013-4359-9743-ad9998444dae',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 23!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-22 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        'c55314b4-0b61-41c9-aa2f-b7fa28adf651',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('6c698c20-754a-42d2-b60f-7f73ca2c6fa0',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 24!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-23 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        'd1ec7d2a-c237-41f7-bc67-77727a61a501',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('e93eed13-105b-486d-bdd2-9e797983192b',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 25!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-24 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));

WITH
    new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
        VALUES (
        '7d88a537-f23f-46de-970e-29ae392cd5f9',
        (SELECT id FROM boards WHERE slug = 'long'))
    RETURNING id),
    posts_insert AS 
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
        VALUES
        ('995d80d3-d8b9-445d-9723-e39f7a682665',
        NULL,
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        '[{"insert":"Post 26!"}]', 
        'text', 
        NULL, 
        'strangers',
        to_timestamp('2020-04-25 05:42:00', 'YYYY-MM-DD HH:MI:SS')))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES
    ((SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'));
