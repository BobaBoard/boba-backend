
/**
 * REST webhooks will return data in the same format as the REST API endpoint that triggered the webhook.
 * Discord webhooks will return a JSON object compatible with Discord's webhook endpoints.
 */
CREATE TYPE webhook_handler_type AS ENUM ('rest', 'discord');

CREATE TABLE IF NOT EXISTS webhooks
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    webhook TEXT NOT NULL,
    handler_type webhook_handler_type NOT NULL
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

CREATE TABLE IF NOT EXISTS realm_report_webhooks
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    realm_id BIGINT REFERENCES realms(id) ON DELETE RESTRICT NOT NULL,
    webhook_id BIGINT REFERENCES webhooks(id) ON DELETE RESTRICT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS user_reports
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    reporter_id BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    reported_at timestamp NOT NULL DEFAULT now(),
    text TEXT NOT NULL,
    reported_thread_id BIGINT REFERENCES threads(id) ON DELETE RESTRICT,
    reported_post_id BIGINT REFERENCES posts(id) ON DELETE RESTRICT,
    reported_comment_id BIGINT REFERENCES comments(id) ON DELETE RESTRICT,
    CONSTRAINT at_most_one
        CHECK (
            (reported_thread_id IS NOT NULL)::INT +
            (reported_post_id IS NOT NULL)::INT +
            (reported_comment_id IS NOT NULL)::INT <= 1
        )
);

CREATE TABLE IF NOT EXISTS user_report_deliveries
(
    report_id BIGINT REFERENCES user_reports(id) ON DELETE RESTRICT NOT NULL,
    webhook_id BIGINT REFERENCES realm_report_webhooks(id) ON DELETE RESTRICT NOT NULL,
    sent_at timestamp 
)