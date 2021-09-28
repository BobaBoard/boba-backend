INSERT INTO user_pinned_boards(board_id,user_id) VALUES 
    ((SELECT id FROM boards where slug = 'gore'),
     (SELECT id FROM Users WHERE username = 'bobatan'));
INSERT INTO user_pinned_boards(board_id,user_id) VALUES 
    ((SELECT id FROM boards where slug = 'anime'),
     (SELECT id FROM Users WHERE username = 'bobatan'));
