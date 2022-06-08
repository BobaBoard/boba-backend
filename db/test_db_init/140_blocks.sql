INSERT INTO blocks(id, string_id, title, index, type) OVERRIDING SYSTEM VALUE VALUES
  (1, '82824aa5-f0dc-46b7-ad7b-aefac7f637cc', 'The twisted rules', 0, 'rules'::block_type),
  (2, '61ab444a-7db3-42f9-86c3-0ac188199fc4', 'Twisted updates', 1, 'subscription'::block_type);

INSERT INTO realm_homepage_blocks(realm_id, block_id) VALUES 
  ((SELECT id FROM realms WHERE slug = 'twisted-minds'), 1),
  ((SELECT id FROM realms WHERE slug = 'twisted-minds'), 2);

INSERT INTO rules(id, title, description, index, pinned) OVERRIDING SYSTEM VALUE VALUES
  (1, 'No language discoursing', 'Anything above Assembly was a mistake.', 2, true),
  (2, 'Be nice to baby coders', 'They''re young and scared, but are doing their best.', 0, true),
  (3, 'No horny on main (boards)', 'If you feel the need to thirst for a fictional character, the fandom category is your friend.', 1, false);

INSERT INTO block_rules(block_id, rule_id) VALUES
  (1, 1),
  (1, 2),
  (1, 3);

INSERT INTO block_subscriptions(block_id, subscription_id) VALUES
  (2, (SELECT id FROM subscriptions WHERE string_id = '11e29fe7-1913-48a5-a3aa-9f01358d212f'));