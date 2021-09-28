INSERT INTO Boards(slug, tagline, avatar_reference_id, settings)
VALUES
    ('main_street', 'For BobaBoard-related discussions.', 'villains.png', '{ "accentColor": "#ff5252" }'),
    ('gore', 'Blood! Blood! Blood!', 'gore.png', '{ "accentColor": "#f96680" }'),
    ('anime', 'I wish I had a funny one for this.', 'anime.png', '{ "accentColor": "#24d282"}'),
    ('long', 'A board to test with many posts.', 'onceler-board.png', '{ "accentColor": "#00b8ff"}'),
    ('memes', 'A board to test collections view.', 'kink-meme.png', '{ "accentColor": "#7b00ff"}');

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