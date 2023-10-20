-- A set of queries usually run manually since we don't have API endpoints for them yet --

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
ALTER TABLE secret_identities
ADD COLUMN external_id TEXT NOT NULL DEFAULT uuid_generate_v4();

--- REMOVE COLUMN FROM TABLE ---
ALTER TABLE threads
DROP COLUMN parent_collection;

--- ADD CHECK TO TABLE ---
ALTER TABLE user_thread_identities
ADD CHECK (identity_id is not null or role_id is not null);

--- REMOVE NULL CONSTRAINT ---
alter table user_thread_identities alter column identity_id drop not null;

--- REMOVE DEFAULT VALUE ---
ALTER TABLE secret_identities ALTER external_id DROP DEFAULT;

--- ADD ENTRY IN RELATIONSHIP FOR EVERY COLUMN IN OTHER TABLE ---
INSERT INTO bobadex_season_secret_identities(bobadex_season_id, secret_identity_id)
SELECT
  3 as bobadex_season_id,
  id AS secret_identity_id
FROM secret_identities;

--- DELETE THREAD ---
DELETE FROM post_categories WHERE post_id IN (SELECT id FROM posts WHERE posts.parent_thread IN (SELECT id FROM threads WHERE string_id = '87f9f92a-067b-4b67-abd1-88ebba77ec6f'));
DELETE FROM post_warnings WHERE post_id IN (SELECT id FROM posts WHERE posts.parent_thread IN (SELECT id FROM threads WHERE string_id = '87f9f92a-067b-4b67-abd1-88ebba77ec6f'));
DELETE FROM comments WHERE id IN (SELECT id FROM comments WHERE comments.parent_thread IN (SELECT id FROM threads WHERE string_id = '87f9f92a-067b-4b67-abd1-88ebba77ec6f'));
DELETE FROM posts WHERE id IN (SELECT id FROM posts WHERE posts.parent_thread IN (SELECT id FROM threads WHERE string_id = '87f9f92a-067b-4b67-abd1-88ebba77ec6f'));
DELETE FROM user_thread_identities WHERE thread_id IN (SELECT id FROM threads WHERE string_id = '87f9f92a-067b-4b67-abd1-88ebba77ec6f');
DELETE FROM user_thread_last_visits WHERE thread_id IN (SELECT id FROM threads WHERE string_id = '87f9f92a-067b-4b67-abd1-88ebba77ec6f');
DELETE FROM user_muted_threads WHERE thread_id IN (SELECT id FROM threads WHERE string_id = '87f9f92a-067b-4b67-abd1-88ebba77ec6f');
DELETE FROM user_hidden_threads WHERE thread_id IN (SELECT id FROM threads WHERE string_id = '87f9f92a-067b-4b67-abd1-88ebba77ec6f');
DELETE FROM identity_thread_accessories WHERE thread_id IN (SELECT id FROM threads WHERE string_id = '87f9f92a-067b-4b67-abd1-88ebba77ec6f');
DELETE FROM threads WHERE string_id = '87f9f92a-067b-4b67-abd1-88ebba77ec6f';

-- DELETE POSTS COMMENT --
DELETE FROM comments WHERE id IN (SELECT id FROM comments WHERE comments.parent_post = (SELECT id FROM posts WHERE string_id = 'f0719153-6eb6-46d0-95fe-db2a9ff69ead'));
-- DELETE POST --
DELETE FROM post_categories WHERE post_id = (SELECT id FROM posts WHERE string_id = 'f0719153-6eb6-46d0-95fe-db2a9ff69ead');
DELETE FROM post_warnings WHERE post_id = (SELECT id FROM posts WHERE string_id = 'f0719153-6eb6-46d0-95fe-db2a9ff69ead');
DELETE FROM posts WHERE string_id =  'f0719153-6eb6-46d0-95fe-db2a9ff69ead';

--- ADD NEW ROLE ---
INSERT INTO roles(string_id, name, avatar_reference_id, color, description, permissions)
VALUES
    ('roleID', 
     'roleName', 
     'roleAvatar',
     'roleColor',
     'roleDescription.',
     ARRAY['post_as_role'::role_permissions_type]);
insert into board_user_roles(user_id, board_id, role_id) VALUES(userId, boardId, roleId);
INSERT INTO realm_user_roles(user_id, role_id) VALUES(user_id, (SELECT id FROM roles WHERE string_id = 'roleID'));

UPDATE roles SET 
    color = '#fe2cc5',
    name = 'Webmistress'
WHERE id = 1;

INSERT INTO role_accessories(role_id, accessory_id) VALUES (
    1,
    9
);

--- ADD NEW PERMISSIONS (+ TYPES) --
ALTER TYPE role_permissions_type ADD VALUE 'edit_category_tags';
ALTER TYPE role_permissions_type ADD VALUE 'edit_content_notices';

UPDATE roles
    SET permissions = array_cat(permissions, ARRAY['edit_category_tags'::role_permissions_type, 'edit_content_notices'::role_permissions_type])
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
    ('v0 releases', 'webhook_url'),
    ('volunteers releases', 'webhook_url');

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
     ARRAY['lock_access'::board_restrictions_type]);

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

ALTER TYPE restriction_type RENAME TO board_restrictions_type;
ALTER TYPE role_permissions RENAME TO role_permissions_type;

-- GET POST TIMINGS --
SELECT
    extract(month from created) as month,
    extract(hour from created) as hour,
    extract(dow from created) as day_of_week,
    extract(doy from created) as day_of_year,
    extract(year from created) as year
FROM posts;