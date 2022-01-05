
CREATE TABLE IF NOT EXISTS webhooks
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    webhook TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    string_id TEXT NOT NULL,
    name TEXT NOT NULL
);
CREATE UNIQUE INDEX subscriptions_entry on subscriptions(string_id);

CREATE TABLE IF NOT EXISTS subscription_webhooks
(
    subscription_id BIGINT REFERENCES subscriptions(id) ON DELETE RESTRICT NOT NULL,
    webhook_id BIGINT REFERENCES webhooks(id) ON DELETE RESTRICT NOT NULL
);
CREATE UNIQUE INDEX subscription_webhook on subscription_webhooks(subscription_id, webhook_id);

CREATE TABLE IF NOT EXISTS board_category_subscriptions
(
    subscription_id BIGINT REFERENCES subscriptions(id) ON DELETE RESTRICT NOT NULL,
    board_id BIGINT REFERENCES boards(id) ON DELETE RESTRICT NOT NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE RESTRICT NOT NULL
);
CREATE UNIQUE INDEX board_category_subscription_entry on board_category_subscriptions(subscription_id, board_id, category_id);

CREATE TABLE IF NOT EXISTS thread_category_subscriptions
(
    thread_id BIGINT REFERENCES threads(id) ON DELETE RESTRICT NOT NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
    subscription_id BIGINT REFERENCES subscriptions(id) ON DELETE RESTRICT NOT NULL
);
CREATE UNIQUE INDEX thread_category_subscriptions_entry on thread_category_subscriptions(thread_id, category_id, subscription_id);
