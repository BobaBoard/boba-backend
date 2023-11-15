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

INSERT INTO Users(firebase_id, username, avatar_reference_id, invited_by)
VALUES
    -- A user that did not set their own username or avatar
    ('a_anon_with_no_name_user_id', NULL, NULL, (SELECT id FROM users WHERE username='oncest5evah'));

-- If you update the realms the users are members of, please update the comments in tests/data/auth.ts
INSERT INTO realm_users(realm_id, user_id)
VALUES
    -- Add boba-tan to uwu and twisted-minds
    ((SELECT id FROM realms WHERE slug = 'twisted-minds'), (SELECT id FROM users WHERE username = 'bobatan')),
    ((SELECT id FROM realms WHERE slug = 'uwu'), (SELECT id FROM users WHERE username = 'bobatan')),
    -- Add SexyDaddy to twisted-minds and uwu
    ((SELECT id FROM realms WHERE slug = 'twisted-minds'), (SELECT id FROM users WHERE username = 'SexyDaddy69')),
    ((SELECT id FROM realms WHERE slug = 'uwu'), (SELECT id FROM users WHERE username = 'SexyDaddy69')),
    -- Add oncest5evah to twisted-minds
    ((SELECT id FROM realms WHERE slug = 'twisted-minds'), (SELECT id FROM users WHERE username = 'oncest5evah')),
    -- Add The Zodiac Killer to uwu
    ((SELECT id FROM realms WHERE slug = 'uwu'), (SELECT id FROM users WHERE username = 'The Zodiac Killer')),
    -- Add a_anon_with_no_name to uwu and twisted-minds
    ((SELECT id FROM realms WHERE slug = 'uwu'), (SELECT id FROM users WHERE firebase_id = 'a_anon_with_no_name_user_id')),
    ((SELECT id FROM realms WHERE slug = 'twisted-minds'), (SELECT id FROM users WHERE firebase_id = 'a_anon_with_no_name_user_id'));

INSERT INTO friends(user_id,friend_id) 
VALUES 
    -- oncest5evah and boba-tan have a mutual friendship
    ((SELECT id FROM users WHERE username = 'bobatan'), (SELECT id FROM users WHERE username = 'oncest5evah')),
    ((SELECT id FROM users WHERE username = 'oncest5evah'), (SELECT id FROM users WHERE username = 'bobatan')),
    -- anon with no name accepted bobatan's friendship, but was not accepted back
    ((SELECT id FROM users WHERE username = 'bobatan'), (SELECT id FROM users WHERE firebase_id = 'a_anon_with_no_name_user_id'));