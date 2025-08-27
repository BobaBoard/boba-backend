/**
 * This table should be exactly the same as the DbRolePermissions enum declared
 * in `types/permissions.ts`.
 *
 * Keep them in sync.
 **/
CREATE TYPE role_permissions_type AS ENUM (
    'all',
    'edit_board_details',
    'delete_board',
    'post_as_role',
    'edit_category_tags',
    'edit_content_notices',
    'move_thread',
    'edit_content',
    'edit_whisper_tags',
    'edit_index_tags',
    'edit_default_view',
    'create_realm_invite',
    'post_on_realm',
    'comment_on_realm',
    'create_thread_on_realm',
    'access_locked_boards_on_realm',
    'view_roles_on_realm',
    'view_roles_on_board',
    'create_board_on_realm'
);

CREATE TABLE IF NOT EXISTS roles
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    string_id TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_reference_id TEXT,
    color TEXT,
    description TEXT,
    permissions role_permissions_type[] NOT NULL DEFAULT '{}'
);
CREATE UNIQUE INDEX roles_string_id on roles(string_id);

CREATE TABLE IF NOT EXISTS board_user_roles(
    user_id BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    board_id BIGINT REFERENCES boards(id) ON DELETE RESTRICT NOT NULL,
    role_id BIGINT REFERENCES roles(id) ON DELETE RESTRICT NOT NULL,
    	/*This is a note admins may add to the role assignment for reference*/
    label TEXT
);
CREATE UNIQUE INDEX board_user_roles_entry on board_user_roles(user_id, board_id, role_id);

CREATE TABLE IF NOT EXISTS realm_user_roles(
    realm_id BIGINT REFERENCES realms(id) ON DELETE RESTRICT NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    role_id BIGINT REFERENCES roles(id) ON DELETE RESTRICT NOT NULL,
    	/*This is a note admins may add to the role assignment for reference*/
    label TEXT
);
CREATE UNIQUE INDEX realm_user_roles_entry on realm_user_roles(user_id, realm_id, role_id);

CREATE TYPE board_restrictions_type AS ENUM ('lock_access', 'delist');
CREATE TABLE IF NOT EXISTS board_restrictions(
    board_id BIGINT REFERENCES boards(id) ON DELETE RESTRICT NOT NULL,
    /**
     * These restrictions are determine what logged out users can or cannot do.
     */
    logged_out_restrictions board_restrictions_type[] NOT NULL DEFAULT ARRAY[]::board_restrictions_type[],
    /**
     * These restrictions are added to determine what logged in users can or cannot do.
     * User roles and associated permissions might change what is effectively allowed for the
     * user.
     */
    logged_in_base_restrictions board_restrictions_type[] NOT NULL DEFAULT ARRAY[]::board_restrictions_type[]
);
CREATE UNIQUE INDEX board_restrictions_entry on board_restrictions(board_id);
