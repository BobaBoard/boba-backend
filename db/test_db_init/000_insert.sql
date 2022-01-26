INSERT INTO Realms(id, string_id, slug)
OVERRIDING SYSTEM VALUE VALUES
    (1, '76ef4cc3-1603-4278-95d7-99c59f481d2e', 'twisted-minds'),
    (2, 'e88590d8-c5fb-44f2-abc2-8cffb5b4cdb1', 'uwu');

INSERT INTO Boards(id, string_id, slug, tagline, avatar_reference_id, parent_realm_id, settings)
OVERRIDING SYSTEM VALUE VALUES
    (1, '2fb151eb-c600-4fe4-a542-4662487e5496', 'main_street', 'For BobaBoard-related discussions.', 'villains.png', 1, '{ "accentColor": "#ff5252" }'),
    (2, 'c6d3d10e-8e49-4d73-b28a-9d652b41beec', 'gore', 'Blood! Blood! Blood!', 'gore.png', 1, '{ "accentColor": "#f96680" }'),
    (3, '4b30fb7c-2aca-4333-aa56-ae8623a92b65', 'anime', 'I wish I had a funny one for this.', 'anime.png', 1, '{ "accentColor": "#24d282"}'),
    (4, 'db8dc5b3-5b4a-4bfe-a303-e176c9b00b83', 'long', 'A board to test with many posts.', 'onceler-board.png', 1, '{ "accentColor": "#00b8ff"}'),
    (5, '0e0d1ee6-f996-4415-89c1-c9dc1fe991dc', 'memes', 'A board to test collections view.', 'kink-meme.png', 1, '{ "accentColor": "#7b00ff"}'),
    (6, '2bdce2fa-12e0-461b-b0fb-1a2e67227434', 'muted', 'A board to test for muting.', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Feded338a-e0e5-4a97-a368-5ae525c0eec4?alt=media&token=914f84b7-a581-430e-bb09-695f653e8e02', 1, '{ "accentColor": "#9b433b" }'),
    (7, '76ebaab0-6c3e-4d7b-900f-f450625a5ed3','restricted', 'A board to test for logged-in only view', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2Fe4e263cf-ee98-4902-9c14-c10299210e01.png?alt=media&token=7c170411-9401-4d4e-9f66-5d6dfee2fccd', 1, '{ "accentColor": "#234a69"}'),
    (8, 'bb62b150-62ae-40a8-8ce2-7e5cdeae9d0b','delisted', 'A board to test for link-only view', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Fc3b86805-4df7-4b1a-9fa2-b96b5165a636?alt=media&token=7652d44a-38cb-40cc-82ef-908cd4265840', 1, '{ "accentColor": "#fa8628"}'),
    (9, '2895f9c8-8419-4ab8-b33d-3ad18e77a589','MODS', 'HELP! I NEED AN ADULT!', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Fc3b86805-4df7-4b1a-9fa2-b96b5165a636?alt=media&token=7652d44a-38cb-40cc-82ef-908cd4265840', 2, '{ "accentColor": "#fa8628"}');

INSERT INTO board_description_sections (id, string_id, board_id,title, description, "type", "index")
OVERRIDING SYSTEM VALUE VALUES 
    (1, 'e541f259-8e6a-42c9-84c3-9c8991945930', 2,'Gore Categories' ,NULL, 'category_filter', 2),
    (2, '51be2abf-d191-4269-830a-e0c51b9fd8e7', 2,'Gore description' ,'[{"insert": "pls b nice"}]', 'text', 1);

INSERT INTO categories(id, category) 
OVERRIDING SYSTEM VALUE VALUES 
    (1, 'blood'),
    (2, 'bruises');

INSERT INTO board_description_section_categories(section_id,category_id) VALUES 
    (1, 1),
    (1, 2);

INSERT INTO categories(id, category)
OVERRIDING SYSTEM VALUE VALUES
    (3, 'odd'),
    (4, 'even');

INSERT INTO board_description_sections (id, string_id, board_id,title, description, "type", "index")
OVERRIDING SYSTEM VALUE VALUES 
    (3, 'db814c12-c530-46d2-b1a3-22ab958886f5', 4,'Long, long filter', NULL, 'category_filter', 1);
;
INSERT INTO board_description_section_categories(section_id,category_id) VALUES 
    (3, 3),
    (3, 4);

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

-- Set the incremental values of the tables we have overrode the system values of
-- See: https://stackoverflow.com/questions/9108833/postgres-autoincrement-not-updated-on-explicit-id-inserts
SELECT setval('realms_id_seq', (SELECT MAX(id) from "realms"));
SELECT setval('boards_id_seq', (SELECT MAX(id) from "boards"));
SELECT setval('categories_id_seq', (SELECT MAX(id) from "categories"));
SELECT setval('board_description_sections_id_seq', (SELECT MAX(id) from "board_description_sections"));