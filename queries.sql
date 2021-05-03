--- DELETE BOARD ---
drop index boards_string_id;
DELETE FROM comments WHERE id IN (SELECT id FROM comments WHERE comments.parent_thread IN (SELECT id FROM threads WHERE parent_board = 3));
DELETE FROM posts WHERE id IN (SELECT id FROM posts WHERE posts.parent_thread IN (SELECT id FROM threads WHERE parent_board = 3));
DELETE FROM user_thread_identities WHERE thread_id IN (SELECT id FROM threads WHERE parent_board = 3);
DELETE FROM user_thread_last_visits WHERE thread_id IN (SELECT id FROM threads WHERE parent_board = 3);
DELETE FROM threads WHERE parent_board = 3;
DELETE FROM user_board_last_visits WHERE board_id = 3;
DELETE FROM boards WHERE id = 3;

--- MOVE THREADS ---
UPDATE threads SET parent_board=6 WHERE string_id = '9fd12dfb-3f56-48e0-b000-58f224e99885';

--- ALTER INDEX TO BE UNIQUE ---
DROP INDEX tags_tag;
CREATE UNIQUE INDEX tags_tag on tags(tag);

-- REMOVE NOT NULL CONSTRAINT --
ALTER TABLE identity_thread_accessories ALTER COLUMN identity_id DROP NOT NULL;

--- ADD COLUMN TO TABLE ---
ALTER TABLE accessories
ADD COLUMN name JSONB NOT NULL DEFAULT '{}'::jsonb;

--- REMOVE COLUMN FROM TABLE ---
ALTER TABLE threads
DROP COLUMN parent_collection;

--- ADD CHECK TO TABLE ---
ALTER TABLE user_thread_identities
ADD CHECK (identity_id is not null or role_id is not null);

--- REMOVE NULL CONSTRAINT ---
alter table user_thread_identities alter column identity_id drop not null;

--- DELETE THREAD ---
DELETE FROM post_categories WHERE post_id IN (SELECT id FROM posts WHERE posts.parent_thread IN (SELECT id FROM threads WHERE string_id = '157b0460-6cfe-416a-9c65-bb35ce2c7521'));
DELETE FROM comments WHERE id IN (SELECT id FROM comments WHERE comments.parent_thread IN (SELECT id FROM threads WHERE string_id = '157b0460-6cfe-416a-9c65-bb35ce2c7521'));
DELETE FROM posts WHERE id IN (SELECT id FROM posts WHERE posts.parent_thread IN (SELECT id FROM threads WHERE string_id = '157b0460-6cfe-416a-9c65-bb35ce2c7521'));
DELETE FROM user_thread_identities WHERE thread_id IN (SELECT id FROM threads WHERE string_id = '157b0460-6cfe-416a-9c65-bb35ce2c7521');
DELETE FROM user_thread_last_visits WHERE thread_id IN (SELECT id FROM threads WHERE string_id = '157b0460-6cfe-416a-9c65-bb35ce2c7521');
DELETE FROM threads WHERE string_id = '157b0460-6cfe-416a-9c65-bb35ce2c7521';

--- TOTAL ACTIVITY ---
select count(*) from threads;
select count(*) from posts;
select count(*) from comments;

--- TOP POSTS BY USERS COUNT ---
SELECT slug, threads.string_id, thread_id, COUNT(user_id) as c FROM user_thread_identities JOIN threads on thread_id = threads.id LEFT JOIN boards on parent_board = boards.id GROUP BY thread_id, string_id, slug ORDER BY c DESC;

--- ADD NEW ROLE ---
INSERT INTO roles(string_id, name, avatar_reference_id, color, description, permissions)
VALUES
    ('roleID', 
     'roleName', 
     'roleAvatar',
     'roleColor',
     'roleDescription.',
     ARRAY['post_as_role'::role_permissions, 'edit_board_details'::role_permissions]);
insert into board_user_roles(user_id, board_id, role_id) VALUES(userId, boardId, roleId);
INSERT INTO realm_user_roles(user_id, role_id) VALUES(user_id, 'role_id');

UPDATE roles SET 
    color = '#fe2cc5',
    name = 'Webmistress'
WHERE id = 1;

INSERT INTO role_accessories(role_id, accessory_id) VALUES (
    1,
    9
);

--- ADD NEW PERMISSIONS (+ TYPES) --
ALTER TYPE role_permissions ADD VALUE 'edit_category_tags';
ALTER TYPE role_permissions ADD VALUE 'edit_content_notices';

UPDATE roles
    SET permissions = array_cat(permissions, ARRAY['edit_category_tags'::role_permissions, 'edit_content_notices'::role_permissions])
    WHERE roles.id = 3;

--UPDATE BOARD AVATAR--
UPDATE Boards SET avatar_reference_id = 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F7d5ff8d8-2ab4-44d2-8d75-7ecb1275f5d7.png?alt=media&token=675745a9-d9fb-45a8-b8fb-c7ec0ab9debf' WHERE slug = 'queerpub';

-- CREATE WEBHOOK SUBSCRIPTION --
INSERT INTO board_category_mappings(board_id, category_id) VALUES
    ((SELECT id FROM boards WHERE slug = 'bobaland'), 
     (SELECT id FROM categories WHERE category = 'announcements'));

INSERT INTO subscriptions(name) VALUES
    ('Announcements');

INSERT INTO board_category_subscriptions(board_category_mapping_id, subscription_id) VALUES
    ((SELECT id from board_category_mappings WHERE board_id = (SELECT id FROM boards WHERE slug = 'bobaland') AND category_id = (SELECT id FROM categories WHERE category = 'announcements')),
     (SELECT id FROM subscriptions WHERE name = 'Announcements'));

INSERT INTO webhooks(name, webhook) VALUES
    ('v0 releases', 'https://discord.com/api/webhooks/794432141470859284/bNmHORaoQkC7S322gCFrg582dOvpmKy-e-78Ng6X_ug7gay6kr5p7M9x8T36lkpX_SOR'),
    ('volunteers releases', 'https://discord.com/api/webhooks/794432615893303337/g9_9r02sDzgFYnuEB4xX6IU7FrL-lO8wYF5YqUHlniMok_fqhiRR_Ne9uQBSdFr2kDBP');

INSERT INTO subscription_webhooks (subscription_id, webhook_id) VALUES
    ((SELECT id FROM subscriptions WHERE name = 'Announcements'),
     (SELECT id FROM webhooks WHERE name = 'v0 channel')),
    ((SELECT id FROM subscriptions WHERE name = 'Announcements'),
     (SELECT id FROM webhooks WHERE name = 'volunteers'));

-- ADD NEW BOARD --
INSERT INTO boards(slug, tagline, avatar_reference_id, settings) VALUES
    ('volunteers',
     'It''s fun to stay at the YBVA (Young Boobies Volunteers Association)',
     'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2Fe4e263cf-ee98-4902-9c14-c10299210e01.png?alt=media&token=7c170411-9401-4d4e-9f66-5d6dfee2fccd',
     '{ "accentColor": "#7b00ff"}');

-- LOCK BOARD --
INSERT INTO board_restrictions(board_id, logged_out_restrictions) VALUES 
((SELECT id FROM boards WHERE slug='volunteers'),
     ARRAY['lock_access'::restriction_type]);

-- ADD NEW ACCESSORY --
INSERT INTO accessories(image_reference_id) VALUES ('https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F7c6c9459-7fa1-4d06-8dc0-ebb5b1bd76a8.png?alt=media&token=78d812a5-b217-4afb-99f3-41b9ed7b7ed5') RETURNING id;


-- FIND FIREBASE IDS FOR IDENTITIES IN THREAD --
SELECT 
    uti.*,
    secret_identities.*, 
FROM threads
LEFT JOIN user_thread_identities uti
ON threads.id = uti.thread_id
INNER JOIN secret_identities
ON uti.identity_id = secret_identities.id
WHERE threads.string_id = '3365000d-cbdf-47d8-8eb3-0e17cd3609b2';