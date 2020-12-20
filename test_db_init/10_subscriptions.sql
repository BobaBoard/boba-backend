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