INSERT INTO blocks(id, string_id, title, index, type) OVERRIDING SYSTEM VALUE VALUES
  (1, '82824aa5-f0dc-46b7-ad7b-aefac7f637cc', 'The twisted rules', 0, 'rules'::block_type);

INSERT INTO realm_homepage_blocks(realm_id, block_id) VALUES 
  (
      (SELECT id FROM realms WHERE slug = 'twisted-minds'),
      1
  );

INSERT INTO rules(id, title, description, index, pinned) OVERRIDING SYSTEM VALUE VALUES
  (1, 'No language discoursing', 'Anything above Assembly was a mistake.', 2, true),
  (2, 'Be nice to baby coders', 'They''re young and scared, but are doing their best.', 0, true),
  (3, 'No horny on main (boards)', 'If you feel the need to thirst for a fictional character, the fandom category is your friend.', 1, false);

INSERT INTO block_rules(block_id, rule_id) VALUES
  (1, 1),
  (1, 2),
  (1, 3);
