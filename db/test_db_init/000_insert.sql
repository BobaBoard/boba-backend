INSERT INTO Boards(string_id, slug, tagline, avatar_reference_id, settings)
VALUES
    ('2fb151eb-c600-4fe4-a542-4662487e5496', 'main_street', 'For BobaBoard-related discussions.', 'villains.png', '{ "accentColor": "#ff5252" }'),
    ('c6d3d10e-8e49-4d73-b28a-9d652b41beec', 'gore', 'Blood! Blood! Blood!', 'gore.png', '{ "accentColor": "#f96680" }'),
    ('4b30fb7c-2aca-4333-aa56-ae8623a92b65', 'anime', 'I wish I had a funny one for this.', 'anime.png', '{ "accentColor": "#24d282"}'),
    ('db8dc5b3-5b4a-4bfe-a303-e176c9b00b83', 'long', 'A board to test with many posts.', 'onceler-board.png', '{ "accentColor": "#00b8ff"}'),
    ('0e0d1ee6-f996-4415-89c1-c9dc1fe991dc', 'memes', 'A board to test collections view.', 'kink-meme.png', '{ "accentColor": "#7b00ff"}');

INSERT INTO board_description_sections (string_id, board_id,title,description,"type","index") VALUES 
('id1', 2,'Gore Categories',NULL,'category_filter',2),('id2', 2,'Gore description','[{"insert": "pls b nice"}]','text',1)
;
INSERT INTO categories(category) VALUES 
  ('blood'),
  ('bruises');

INSERT INTO board_description_section_categories(section_id,category_id) VALUES 
  (1,1),
  (1,2);
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
