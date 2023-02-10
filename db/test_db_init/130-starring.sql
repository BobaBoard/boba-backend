INSERT INTO user_starred_threads(user_id, thread_id) VALUES
    ((SELECT id FROM users WHERE username = 'jersey_devil_69'),
    (SELECT id from threads WHERE external_id = '29d1b2da-3289-454a-9089-2ed47db4967b'));
INSERT INTO user_starred_threads(user_id, thread_id) VALUES
    ((SELECT id FROM users WHERE username = 'jersey_devil_69'),
    (SELECT id from threads WHERE external_id = 'a5c903df-35e8-43b2-a41a-208c43154671'));
