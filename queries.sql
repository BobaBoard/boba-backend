##### DELETE BOARD####
drop index boards_string_id;
DELETE FROM comments WHERE id IN (SELECT id FROM comments WHERE comments.parent_thread IN (SELECT id FROM threads WHERE parent_board = 3));
DELETE FROM posts WHERE id IN (SELECT id FROM posts WHERE posts.parent_thread IN (SELECT id FROM threads WHERE parent_board = 3));
DELETE FROM user_thread_identities WHERE thread_id IN (SELECT id FROM threads WHERE parent_board = 3);
DELETE FROM user_thread_last_visits WHERE thread_id IN (SELECT id FROM threads WHERE parent_board = 3);
DELETE FROM threads WHERE parent_board = 3;
DELETE FROM user_board_last_visits WHERE board_id = 3;
DELETE FROM boards WHERE id = 3;

#### MOVE THREADS ####
UPDATE threads SET parent_board=6 WHERE string_id = '9fd12dfb-3f56-48e0-b000-58f224e99885';

### ALTER INDEX TO BE UNIQUE ###
DROP INDEX tags_tag;
CREATE UNIQUE INDEX tags_tag on tags(tag);

### ADD COLUMN TO TABLE ####
ALTER TABLE comments
ADD chain_parent_comment2 BIGINT REFERENCES comments(id) ON DELETE RESTRICT;

#### ADD USER ####

INSERT INTO Users(firebase_id, username, avatar_reference_id, invited_by)
VALUES
    ('jKj4Q57BwCTYrYzRGvYKA34d6Bd2', 'wryhts', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Fba885887-b094-43c5-af98-bf82317df424?alt=media&token=72c8140c-f13b-4e47-8bee-ef0f3a8c7940', NULL),
    ('lrjzLVZgJidguqKwgTVXLs66bKD2', 'stitch', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Ff95cbd85-02d9-4ad2-8c66-a98afd52fafb?alt=media&token=f43cc2a9-5654-4c99-adcb-8338a7a3de8b', NULL),
    ('eGZzHMLhmMcGYeLHnzGjNoCPDsB3', 'kingshark2', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F80a76c9a-919c-42ea-b673-419017ef63e7?alt=media&token=0b0e9437-31b6-483d-be27-af38bd13430d', NULL),
    ('XsBCYjnTNnTWbgs2moknhAPzAci1', 'Franzeska', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Ff964170f-e9a8-468f-ad10-ef66fc648132?alt=media&token=f476f2b0-20ea-4e7d-9c4b-38e20c38c6be', NULL),
    ('W9AGS2DBCmZIQrVDzYLuWE4RmSL2', 'KiRAWRa', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F612751a7-0cb7-4c61-bad1-4e9e2c9b1852?alt=media&token=ccbdae5a-3592-4cf7-b7c9-172e9b458aa9', NULL);


INSERT INTO Users(firebase_id, username, avatar_reference_id, invited_by)
VALUES
    ('paXj8dO4YBNQx2WJj4o4rmhL7QJ2', 'DoubleDouble', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F9f314b85-a943-4307-9b3c-747c45fc0b59?alt=media&token=886cc9d7-0d19-490b-acb6-303a3510c1e3', NULL),
    ('xADxTUH849atibDmIxkbLsy9v9D2', 'ushas42', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F5b505dd0-75ad-492a-8280-b8acaf63f194?alt=media&token=dfe17a6d-bca4-4079-9e5b-ee23327ca9f3', NULL),
    ('c5ERSjQcRyVJT2atYVJCpXnYiH62', 'edgeduchess', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Ff0e91d9c-c1c0-48b4-81eb-271ac7666313?alt=media&token=5e9603dc-0ec9-4ca5-951d-4dae359f56bb', NULL),
    ('jaoI0WYVgtV2tHPEKs2wplpuxGk1', 'krad', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F9f314b85-a943-4307-9b3c-747c45fc0b59?alt=media&token=886cc9d7-0d19-490b-acb6-303a3510c1e3', NULL),
    ('ivpxDZ3GIAdjSydLxidGHf7plJF2', 'Julia', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Fb4545532-326e-445d-8d32-3a3d15213614?alt=media&token=4d51b498-17ae-430d-8754-2df085fab321', NULL);



INSERT INTO Users(firebase_id, username, avatar_reference_id, invited_by)
VALUES
    ('TkuW3NwEvSNe8QlfOpNTF38laZD3', 'Dabiyyah', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F9f314b85-a943-4307-9b3c-747c45fc0b59?alt=media&token=886cc9d7-0d19-490b-acb6-303a3510c1e3', NULL),
    ('eJkLdtCShhVTgNWmjw70K8a8Aqs1', 'Irenes', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Ff5a35653-7e9a-4485-b89a-e2f3acd5ddf5?alt=media&token=edad2b77-2dbd-4c12-9eda-42d53f2cbd04', NULL),
    ('pmv3BcXeKAYKX8XtK3hnJ76WI2z1', 'pizzagate', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F82c9b1a9-1b29-47a9-8939-eff9e47af89d?alt=media&token=89706703-1cd5-4efb-94a9-d2efd39098f6', NULL),
    ('hwqO40WWYYYNbYZj7811EfZF4642', 'Tango', '', NULL),
    ('QKfOtUWxMzbiVOZC2cLCnwrt57B2', 'Yuu', '', NULL);
    
INSERT INTO Users(firebase_id, username, avatar_reference_id, invited_by)
VALUES
    ('ZDFlphXtnrZVJpOMVbIymakkGrM2', 'vaincity', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Ff8abde62-6aab-4dfd-8949-08424a74078c?alt=media&token=4852526c-2b88-4325-9d95-32c6a8b23e7c', NULL);

INSERT INTO Users(firebase_id, username, avatar_reference_id, invited_by)
VALUES
('5QYRmektxxXa8WGTpZPA9MzNtqj1', 'Radial', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Fbb74c6c5-0c31-4aad-a9ad-7af46dd6916f?alt=media&token=994c5b8a-405e-4e5b-8aca-24f4c32e9742', NULL);


INSERT INTO Users(firebase_id, username, avatar_reference_id, invited_by)
VALUES
('jIcoToapd0Smi3pWhmagmJKgv3G2', 'playerprophet', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Fa3792b86-14de-4711-bf07-a7b1188211b5?alt=media&token=8eb68019-0e0a-4220-b6fc-badb9ef3bd38', NULL);




INSERT INTO Users(firebase_id, username, avatar_reference_id, invited_by)
VALUES
    ('w0OV2FvY2KXgDsVPVjf6iBmNQGJ3', 'Starshell', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Fb835cd8b-1f11-4be0-9d92-a75f6311b916?alt=media&token=de13c86c-20c9-4e2c-a0f4-498c10219c41', NULL),
    ('YHAeD9jjozYvcRmYfqJJ0QzeNHo2', 'Pengiesama', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F853b632e-6245-4fea-b4cf-2162a15b8201?alt=media&token=2b689607-70bd-495b-89d8-61c4aa0778ca', NULL);