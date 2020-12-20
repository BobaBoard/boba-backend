INSERT INTO accessories(image_reference_id) VALUES 
    ('https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485'),
    ('https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F989f4b40-c1b8-4793-93dd-57e93df3e7ec.png?alt=media&token=cabdd8d5-b6a9-4914-bb59-eda4629f151b');
INSERT INTO identity_thread_accessories(thread_id,identity_id, accessory_id) VALUES 
    ((SELECT id FROM threads WHERE string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'),
     (SELECT id FROM secret_identities WHERE display_name = 'Old Time-y Anon'),
     1),
     ((SELECT id FROM threads WHERE string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'),
     (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'),
     2);

-- TODO: Move this

INSERT INTO board_category_mappings(id, board_id, category_id) OVERRIDING SYSTEM VALUE VALUES
    -- Maps to "blood" category in "!gore"
    (1, 2, 1),
    (2, 2, 2);
INSERT INTO subscriptions(id, name) OVERRIDING SYSTEM VALUE VALUES
    (1, 'blood & bruises'),
    (2, 'blood');

INSERT INTO board_category_subscriptions(board_category_mapping_id, subscription_id) OVERRIDING SYSTEM VALUE VALUES
    (1, 1),
    (2, 1),
    (1, 2);

INSERT INTO webhooks(id, name, webhook) OVERRIDING SYSTEM VALUE VALUES
    (1, 'realm of terror', 'https://discord.com/api/webhooks/742587505404018708/sO1hhlNGbWMvFge7ihP3b_VJKIshmtD5avfTRIjeG70nhXOp9Oj__83pvtPnTrF59oWV'),
    (2, 'volunteers', 'https://discord.com/api/webhooks/788877360681189416/UAZQH6Xhz9qQAG51yWEIGmPba1p5yfR6Cet4yyQizUx5jL_r0_Qj3QA92PyRY7qEZCtK');

INSERT INTO subscription_webhooks (subscription_id, webhook_id) VALUES
    (1, 1),
    (2, 2);