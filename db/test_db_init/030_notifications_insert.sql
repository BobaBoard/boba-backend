INSERT INTO user_board_last_visits(user_id, board_id, last_visit_time) VALUES
  ((SELECT id FROM users WHERE username = 'bobatan'),
   (SELECT id FROM boards WHERE slug = 'anime'),
    -- Give bobatan a board visit so she has unseen comments, but they're before her last visit.
    to_timestamp('2022-05-10 9:42:00', 'YYYY-MM-DD HH:MI:SS'));

INSERT INTO user_thread_last_visits(user_id, thread_id, last_visit_time) VALUES
  ((SELECT id FROM users WHERE username = 'bobatan'),
   (SELECT id FROM threads WHERE string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'),
    -- Give bobatan a visit so she has unseen comments, but they're from her.
    to_timestamp('2020-05-10 9:42:00', 'YYYY-MM-DD HH:MI:SS')),
  ((SELECT id FROM users WHERE username = 'oncest5evah'),
   (SELECT id FROM threads WHERE string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'),
    -- Give oncest5evah a visit so he has unseen comments.
    to_timestamp('2020-05-10 9:42:00', 'YYYY-MM-DD HH:MI:SS'));

INSERT INTO user_thread_last_visits(user_id, thread_id, last_visit_time) VALUES
  ((SELECT id FROM users WHERE username = 'bobatan'),
   (SELECT id FROM threads WHERE string_id = 'a5c903df-35e8-43b2-a41a-208c43154671'),
    -- Give bobatan a visit past the last post so she has no unseen posts.
    to_timestamp('2020-05-25 9:42:00', 'YYYY-MM-DD HH:MI:SS')),
  ((SELECT id FROM users WHERE username = 'oncest5evah'),
   (SELECT id FROM threads WHERE string_id = 'a5c903df-35e8-43b2-a41a-208c43154671'),
    -- Give oncest5evah a visit so he has unseen posts.
    to_timestamp('2020-05-01 9:42:00', 'YYYY-MM-DD HH:MI:SS')),
  ((SELECT id FROM users WHERE username = 'jersey_devil_69'),
   (SELECT id FROM threads WHERE string_id = 'a5c903df-35e8-43b2-a41a-208c43154671'),
    -- Give jersey_devil_69 a visit so he has unseen posts, but from them.
    to_timestamp('2020-05-01 9:42:00', 'YYYY-MM-DD HH:MI:SS'));

INSERT INTO dismiss_notifications_requests(user_id, realm_id, dismiss_request_time) VALUES
  ((SELECT id FROM users WHERE username = 'SexyDaddy69'),
    -- SexyDaddy69 dismissed notifications end of april, so everything from May should be new.
    -- However, despite never having visited any post, everything from before then should be
    -- marked as viewed.
    (SELECT id FROM realms WHERE slug = 'twisted-minds'),
    to_timestamp('2020-04-30 23:59:59', 'YYYY-MM-DD HH24:MI:SS')),
  ((SELECT id FROM users WHERE username = 'bobatan'),
    -- Give Bobatan a really far in the past dismiss date to check it doesn't interfere with queries
    -- without changing the logic of other tests.    
    (SELECT id FROM realms WHERE slug = 'twisted-minds'),
    to_timestamp('2019-01-01 00:00:00', 'YYYY-MM-DD HH24:MI:SS')),
  ((SELECT id FROM users WHERE username = 'The Zodiac Killer'),
    -- Give The Zodiac Killer a date in-between the new threads in the long board.
    -- He has visited some threads before then, but everything since that date should
    -- be dismissed.    
    (SELECT id FROM realms WHERE slug = 'twisted-minds'),
    to_timestamp('2020-04-20 00:00:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO dismiss_board_notifications_requests(user_id, board_id, dismiss_request_time) VALUES
  ((SELECT id FROM users WHERE username = 'oncest5evah'),
   (SELECT id FROM boards WHERE slug = 'long'),
    -- Give oncest5evah a date in-between the new threads in the long board.
    -- He has dismissed notifications before then, but everything since that date should
    -- be new.
    to_timestamp('2020-04-20 00:00:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO user_thread_last_visits(user_id, thread_id, last_visit_time) VALUES
  ((SELECT id FROM users WHERE username = 'The Zodiac Killer'),
   (SELECT id FROM threads WHERE string_id = '32a0174b-091e-4fe6-82f3-bffd6c6026ae'),
    to_timestamp('2020-04-19 00:00:00', 'YYYY-MM-DD HH24:MI:SS')),
  ((SELECT id FROM users WHERE username = 'The Zodiac Killer'),
   (SELECT id FROM threads WHERE string_id = '43784970-31f1-4e09-99d6-2b6526b353fe'),
    to_timestamp('2020-04-18 00:00:00', 'YYYY-MM-DD HH24:MI:SS')),
  ((SELECT id FROM users WHERE username = 'The Zodiac Killer'),
   (SELECT id FROM threads WHERE string_id = 'c55314b4-0b61-41c9-aa2f-b7fa28adf651'),
    to_timestamp('2020-04-24 00:00:00', 'YYYY-MM-DD HH24:MI:SS')),
  -- Anime thread
  ((SELECT id FROM users WHERE username = 'The Zodiac Killer'),
   (SELECT id FROM threads WHERE string_id = 'b27710a8-0a9f-4c09-b3a5-54668bab7051'),
    to_timestamp('2020-04-26 00:00:00', 'YYYY-MM-DD HH24:MI:SS'));

/**
 *  Notification dismissal requests for uwu realm.
 */
INSERT INTO dismiss_notifications_requests(user_id, realm_id, dismiss_request_time) VALUES
  -- SexyDaddy69 has dismissed notifications in more than a realm.
  ((SELECT id FROM users WHERE username = 'SexyDaddy69'),
    (SELECT id FROM realms WHERE slug = 'uwu'),
    to_timestamp('2021-04-30 23:59:59', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO dismiss_board_notifications_requests(user_id, board_id, dismiss_request_time) VALUES
  -- SexyDaddy69 has dismissed notifications in more than a realm.
  ((SELECT id FROM users WHERE username = 'SexyDaddy69'),
   (SELECT id FROM boards WHERE slug = 'MODS'),
    to_timestamp('2022-04-20 00:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO user_thread_last_visits(user_id, thread_id, last_visit_time) VALUES
  ((SELECT id FROM users WHERE username = 'SexyDaddy69'),
   (SELECT id FROM threads WHERE string_id = '4d8471e5-a066-419c-96e4-456c95ade41d'),
    to_timestamp('2022-04-19 00:00:00', 'YYYY-MM-DD HH24:MI:SS'));