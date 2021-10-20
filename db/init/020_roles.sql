/**
 * This table should be exactly the same as the DbRolePermissions enum declared
 * in `types/permissions.ts`.
 *
 * Keep them in sync.
 **/
CREATE TYPE role_permissions AS ENUM (
    'all', 
    'edit_board_details', 
    'post_as_role', 
    'edit_category_tags', 
    'edit_content_notices',
    'move_thread',
    'edit_content',
    'edit_whisper_tags',
    'edit_index_tags',
    'edit_default_view',
);

CREATE TABLE IF NOT EXISTS roles
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    string_id TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_reference_id TEXT,
    color TEXT,
    description TEXT,
    permissions role_permissions[] NOT NULL DEFAULT '{}'
);
CREATE UNIQUE INDEX roles_string_id on roles(string_id);

CREATE TABLE IF NOT EXISTS board_user_roles(
    user_id BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    board_id BIGINT REFERENCES boards(id) ON DELETE RESTRICT NOT NULL,
    role_id BIGINT REFERENCES roles(id) ON DELETE RESTRICT NOT NULL
);
CREATE UNIQUE INDEX board_user_roles_entry on board_user_roles(user_id, board_id);

CREATE TABLE IF NOT EXISTS realm_user_roles(
    -- Add realm id when realms *actually* exist.
    user_id BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    role_id BIGINT REFERENCES roles(id) ON DELETE RESTRICT NOT NULL
);
CREATE UNIQUE INDEX realm_user_roles_entry on realm_user_roles(user_id);
