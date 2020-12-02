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

--- ADD COLUMN TO TABLE ---
ALTER TABLE threads
ADD COLUMN options JSONB NOT NULL DEFAULT '{}'::jsonb;

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

--UPDATE BOARD AVATAR--
UPDATE Boards SET avatar_reference_id = 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F7d5ff8d8-2ab4-44d2-8d75-7ecb1275f5d7.png?alt=media&token=675745a9-d9fb-45a8-b8fb-c7ec0ab9debf' WHERE slug = 'queerpub';