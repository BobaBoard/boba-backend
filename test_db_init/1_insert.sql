/*INSERT INTO Boards(title, stringId, description, avatar, settings)
VALUES
    ('Main Street, Bobaland.', 'main_street', 'The main board. Keep it safe.', NULL, '{}'),
    ('Gore Central', 'gore', 'Everything the light touches is dead doves.', NULL, '{}'),
    ('Videogames', 'vg', 'Random videogame discussions. Tag your NSFW.', NULL, '{}');
  
INSERT INTO Users(name)
VALUES
    ('bobatan'),
    ('jersey_devil_69'),
    ('oncest5evah');

INSERT INTO Threads(parentBoard, title, content, author)
VALUES
  ((SELECT id FROM Boards WHERE stringId = 'main_street'), 
  'A random thread', 
  'Hi this is  a thread', 
  (SELECT id FROM Users WHERE name = 'bobatan')),
  ((SELECT id FROM Boards WHERE stringId = 'gore'), 
  'This is another thread', 
  'Hi this is  a second thread', 
  (SELECT id FROM Users WHERE name = 'oncest5evah'));
  */