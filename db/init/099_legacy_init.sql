
/*
 * A mapping of which identity has been assigned to a user in each thread.
 */
CREATE TABLE IF NOT EXISTS user_thread_identities
(
    thread_id BIGINT REFERENCES threads(id) NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    identity_id BIGINT REFERENCES secret_identities(id) ON DELETE RESTRICT,
    role_id BIGINT REFERENCES roles(id) ON DELETE RESTRICT,
    CHECK (identity_id is not null or role_id is not null)
);
CREATE INDEX user_thread_identities_thread_id on user_thread_identities(thread_id);

CREATE TABLE IF NOT EXISTS accessories
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    string_id TEXT NOT NULL,
    name TEXT,
    image_reference_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS realm_accessories
(
    -- Add realm id when realms *actually* exist.
    accessory_id BIGINT REFERENCES accessories(id) NOT NULL
);

/*
 * A mapping of which accessory has been assigned to an identity in each thread.
 */
CREATE TABLE IF NOT EXISTS identity_thread_accessories
(
    thread_id BIGINT REFERENCES threads(id) ON DELETE RESTRICT NOT NULL,
    identity_id BIGINT REFERENCES secret_identities(id) ON DELETE RESTRICT,
    role_id BIGINT REFERENCES roles(id) ON DELETE RESTRICT,
    accessory_id BIGINT REFERENCES accessories(id) ON DELETE RESTRICT NOT NULL,
    CHECK (identity_id is not null or role_id is not null)
);
CREATE INDEX identity_thread_accessories_thread_id on identity_thread_accessories(thread_id);

CREATE TABLE IF NOT EXISTS role_accessories
(
    role_id BIGINT REFERENCES roles(id) ON DELETE RESTRICT NOT NULL,
    accessory_id BIGINT REFERENCES accessories(id) ON DELETE RESTRICT NOT NULL
);
CREATE INDEX role_accessories_role_id on role_accessories(role_id);

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

CREATE TABLE IF NOT EXISTS subscriptions
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    string_id TEXT NOT NULL,
    name TEXT NOT NULL
);
CREATE UNIQUE INDEX subscriptions_entry on subscriptions(string_id);

CREATE TABLE IF NOT EXISTS webhooks
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    webhook TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS subscription_webhooks
(
    subscription_id BIGINT REFERENCES subscriptions(id) ON DELETE RESTRICT NOT NULL,
    webhook_id BIGINT REFERENCES webhooks(id) ON DELETE RESTRICT NOT NULL
);
CREATE UNIQUE INDEX subscription_webhook on subscription_webhooks(subscription_id, webhook_id);

CREATE TYPE setting_name AS ENUM(
    'FESTIVE_BACKGROUND_HEADER',
    'FESTIVE_BACKGROUND_FEED',
    'FESTIVE_BACKGROUND_SIDEBAR', 
    'FESTIVE_CURSOR', 
    'FESTIVE_CURSOR_TRAIL');
CREATE TYPE setting_type AS ENUM(
    'BOOLEAN'
);

CREATE TABLE IF NOT EXISTS setting_types(
    name setting_name NOT NULL UNIQUE,
    type setting_type NOT NULL
);
CREATE INDEX setting_types_name on setting_types(name);

CREATE TABLE IF NOT EXISTS user_settings(
    user_id BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    setting_name setting_name REFERENCES setting_types(name) ON DELETE RESTRICT NOT NULL,
    setting_value TEXT
);
CREATE INDEX user_settings_user_id on user_settings(user_id);
CREATE INDEX user_settings_setting_name on user_settings(setting_name);
CREATE UNIQUE INDEX user_settings_setting_user_id_setting_name on user_settings(user_id, setting_name);