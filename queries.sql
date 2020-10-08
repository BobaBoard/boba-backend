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
ALTER TABLE comments
ADD COLUMN chain_parent_comment BIGINT REFERENCES comments(id) ON DELETE RESTRICT;

--- ADD CHECK TO TABLE ---
ALTER TABLE user_thread_identities
ADD CHECK (identity_id is not null or role_id is not null);

--- REMOVE NULL CONSTRAINT ---
alter table user_thread_identities alter column identity_id drop not null;

--- DELETE THREAD ---
DELETE FROM comments WHERE id IN (SELECT id FROM comments WHERE comments.parent_thread IN (SELECT id FROM threads WHERE string_id = 'acaee816-6bfa-4d41-be01-d35325d3ef33'));
DELETE FROM posts WHERE id IN (SELECT id FROM posts WHERE posts.parent_thread IN (SELECT id FROM threads WHERE string_id = 'acaee816-6bfa-4d41-be01-d35325d3ef33'));
DELETE FROM user_thread_identities WHERE thread_id IN (SELECT id FROM threads WHERE string_id = 'acaee816-6bfa-4d41-be01-d35325d3ef33');
DELETE FROM user_thread_last_visits WHERE thread_id IN (SELECT id FROM threads WHERE string_id = 'acaee816-6bfa-4d41-be01-d35325d3ef33');
DELETE FROM threads WHERE string_id = 'acaee816-6bfa-4d41-be01-d35325d3ef33';