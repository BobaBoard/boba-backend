-- If you update the roles or the users they are assigned to, please update the comments in test/data/auth.ts
INSERT INTO roles(string_id, name, avatar_reference_id, color, description, permissions)
VALUES
    ('e5f86f53-6dcd-4f15-b6ea-6ca1f088e62d', 'GoreMaster5000', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8',
        'red', 'A role for people who can edit the gore board.',
        ARRAY['edit_board_details'::role_permissions_type,
              'delete_board'::role_permissions_type,
              'post_as_role'::role_permissions_type,
              'edit_category_tags'::role_permissions_type,
              'edit_content_notices'::role_permissions_type]
              ),
    ('70485a1e-4ce9-4064-bd87-440e16b2f219', 'The Memester', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F01af97fa-e240-4002-81fb-7abec9ee984b?alt=media&token=ac14effe-a788-47ae-b3b8-cbb3d8ad8f94',
        'blue', 'A role for the real memers.',
        ARRAY['all'::role_permissions_type]),
    ('3df1d417-c36a-43dd-aaba-9590316ffc32', 'The Owner', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F2df7dfb4-4c64-4370-8e74-9ee30948f05d?alt=media&token=26b16bef-0fd2-47b5-b6df-6cf2799010ca',
        'pink', 'A role for the owner.',
        ARRAY['edit_board_details'::role_permissions_type,
              'post_as_role'::role_permissions_type,
              'move_thread'::role_permissions_type,
              'create_realm_invite'::role_permissions_type,
              'view_roles_on_realm'::role_permissions_type,
              'view_roles_on_board'::role_permissions_type,
              'create_board_on_realm'::role_permissions_type]);

INSERT INTO board_user_roles(user_id, board_id, role_id, label)
VALUES
    ((SELECT id FROM users WHERE username = 'bobatan'),
     (SELECT id FROM boards WHERE slug = 'gore'),
     (SELECT id FROM roles WHERE name = 'GoreMaster5000'),
     'Test Label'),
    ((SELECT id FROM users WHERE username = 'bobatan'),
     (SELECT id FROM boards WHERE slug = 'memes'),
     (SELECT id FROM roles WHERE name = 'The Memester'),
     'Test Label');

INSERT INTO realm_user_roles(realm_id, user_id, role_id, label)
VALUES
    ((SELECT id FROM realms WHERE slug = 'twisted-minds'),
     (SELECT id FROM users WHERE username = 'bobatan'),
     (SELECT id FROM roles WHERE name = 'The Owner'),
     'Look ma, a label'),
    ((SELECT id FROM realms WHERE slug = 'uwu'),
     (SELECT id FROM users WHERE username = 'bobatan'),
     (SELECT id FROM roles WHERE name = 'The Memester'),
     'meme machine'),
    ((SELECT id FROM realms WHERE slug = 'twisted-minds'),
     (SELECT id FROM users WHERE username = 'bobatan'),
     (SELECT id FROM roles WHERE name = 'GoreMaster5000'),
     'we have fun here'),
    ((SELECT id FROM realms WHERE slug = 'twisted-minds'),
     (SELECT id FROM users WHERE username = 'SexyDaddy69'),
     (SELECT id FROM roles WHERE name = 'The Owner'),
     'well earned'),
    ((SELECT id FROM realms WHERE slug = 'uwu'),
     (SELECT id FROM users WHERE username = 'The Zodiac Killer'),
     (SELECT id FROM roles WHERE name = 'The Owner'),
     'hello world'),
    ((SELECT id FROM realms WHERE slug = 'twisted-minds'),
     (SELECT id FROM users WHERE username = 'oncest5evah'),
     (SELECT id FROM roles WHERE name = 'GoreMaster5000'),
     '');

INSERT INTO content_warnings(warning)
VALUES
  ('harassment PSA');

WITH
  new_thread_id AS
    (INSERT INTO threads(string_id, parent_board)
      VALUES (
        '8b2646af-2778-487e-8e44-7ae530c2549c',
        (SELECT id FROM boards WHERE slug = 'gore'))
     RETURNING id),
  posts_insert AS
    (INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, created)
      VALUES
        ('ff9f2ae2-a254-4069-9791-3ac5e6dff5bb',
         NULL,
         (SELECT id FROM new_thread_id),
         (SELECT id FROM Users WHERE username = 'bobatan'),
         '[{"insert":"Remember to be excellent to each other and only be mean to fictional characters!"}]',
         'text',
         ARRAY['An announcement from your headmaster!'],
         'strangers',
         to_timestamp('2020-09-25 05:42:00', 'YYYY-MM-DD HH:MI:SS'))
     RETURNING id),
  comments_insert1 AS
    (INSERT INTO comments(string_id, parent_post, parent_thread, author, created, content, anonymity_type)
      VALUES (
        'd3c21e0c-7ab9-4cb6-b1ed-1b7e558ba375',
        (SELECT id FROM posts_insert ORDER BY id DESC LIMIT 1),
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
        to_timestamp('2020-10-02 05:43:00', 'YYYY-MM-DD HH:MI:SS'),
        '[{"insert":"But can we be mean to you?"}]',
        'strangers'
      ) RETURNING id),
  comments_insert2 AS
    (INSERT INTO comments(string_id, parent_post, parent_thread, author, created, content, anonymity_type, parent_comment)
      VALUES (
        '146d4087-e11e-4912-9d67-93065b9a0c78',
        (SELECT id FROM posts_insert ORDER BY id DESC LIMIT 1),
        (SELECT id FROM new_thread_id),
        (SELECT id FROM Users WHERE username = 'bobatan'),
        to_timestamp('2020-10-04 05:44:00', 'YYYY-MM-DD HH:MI:SS'),
        '[{"insert":"BobaNitro users can be mean to the webmaster once a month."}]',
        'strangers',
        (SELECT id FROM comments_insert1 LIMIT 1)
      )),
  content_notice_insert AS
    (INSERT INTO post_warnings(post_id, warning_id)
      VALUES(
        (SELECT id FROM posts_insert ORDER BY id DESC LIMIT 1),
        (SELECT id FROM content_warnings WHERE warning = 'harassment PSA')
      ))
INSERT INTO user_thread_identities(thread_id, user_id, identity_id, role_id)
    VALUES
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'jersey_devil_69'),
      (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'),
      NULL),
     ((SELECT id FROM new_thread_id),
      (SELECT id FROM Users WHERE username = 'bobatan'),
      NULL,
      (SELECT id FROM roles WHERE name = 'GoreMaster5000'));
