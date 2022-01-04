
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

/*
 * A mapping of a category in a board, used for subscriptions.
 *
 * TODO: there is a major problem here where categories are mapped to names, rather than to
 * special IDs within the board. This means that what you're subscribing to is a particular
 * *name* of a category used within a board, and currently admins cannot really do a renaming
 * that keeps all relationships the same (without renaming for every single board).
 *
 * TODO: this can likely directly be folded in board_category_subscription.
 */
CREATE TABLE IF NOT EXISTS board_category_mappings
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    board_id BIGINT REFERENCES boards(id) ON DELETE RESTRICT NOT NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE RESTRICT NOT NULL
);
CREATE UNIQUE INDEX board_category_mappings_entry on board_category_mappings(category_id, board_id);

CREATE TABLE IF NOT EXISTS board_category_subscriptions
(
    board_category_mapping_id BIGINT REFERENCES board_category_mappings(id) ON DELETE RESTRICT NOT NULL,
    subscription_id BIGINT REFERENCES subscriptions(id) ON DELETE RESTRICT NOT NULL
);
CREATE UNIQUE INDEX board_category_subscription on board_category_subscriptions(board_category_mapping_id, subscription_id);

CREATE TABLE IF NOT EXISTS thread_category_subscriptions
(
    thread_id BIGINT REFERENCES threads(id) ON DELETE RESTRICT NOT NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
    subscription_id BIGINT REFERENCES subscriptions(id) ON DELETE RESTRICT NOT NULL
);
CREATE UNIQUE INDEX thread_category_subscriptions_entry on thread_category_subscriptions(thread_id, category_id, subscription_id);
