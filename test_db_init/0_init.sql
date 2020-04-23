CREATE TABLE IF NOT EXISTS users
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    /* This will be the id generated by firebase. */
    firebase_id TEXT NOT NULL,
    /* Username and avatar can be null. Defaults will be used. Users can defer
     * creating these until they add friends. */
    username TEXT,
    /* Reference to the id of the image on external storage provider. */
    avatar_reference_id TEXT,
    invited_by BIGINT REFERENCES users(id) NOT NULL
);
CREATE INDEX users_firebase_id on users(firebase_id);

/*
 * This is not a simmetric relationship. Friends must be added in
 * both directions.
 */
CREATE TABLE IF NOT EXISTS friends
(
    user_id BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    friend_id BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL
);
CREATE INDEX friends_user on friends(user_id);

CREATE TYPE invite_type AS ENUM ('website', 'identityShare');
CREATE TABLE IF NOT EXISTS invites (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    nonce BIGINT NOT NULL,
    inviter BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    invitee BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    /* Timestamp the invite was sent at, UTC. */
    created timestamp NOT NULL DEFAULT now(),
    duration INTERVAL NOT NULL,
    invite_type invite_type[] NOT NULL
);
CREATE INDEX invites_inviter on invites(inviter);
CREATE INDEX invites_invitee on invites(invitee);
CREATE INDEX invites_nonce on invites(nonce);

CREATE TABLE IF NOT EXISTS tags
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    tag TEXT NOT NULL
);
CREATE INDEX tags_tag on tags(tag);

CREATE TABLE IF NOT EXISTS boards
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    /* Textual id of the board, e.g. "main", "anime", "memes". Used as part of the url. */
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    /* Reference to the id of the image on external storage provider. */
    avatar_reference_id TEXT,
    settings JSONB NOT NULL
);
CREATE INDEX boards_string_id on boards(slug);

CREATE TABLE IF NOT EXISTS board_tags
(
    board_id BIGINT REFERENCES boards(id) ON DELETE RESTRICT NOT NULL,
    tag_id BIGINT REFERENCES tags(id) ON DELETE RESTRICT NOT NULL
);

CREATE TABLE IF NOT EXISTS tag_deny_list
(
    user_id BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    tag_id BIGINT REFERENCES tags(id) ON DELETE RESTRICT NOT NULL,
    /* If not null the tag is deny-listed only on the given board. */
    board_id BIGINT REFERENCES boards(id) ON DELETE RESTRICT
);
CREATE INDEX tag_denly_list_user_id on tag_deny_list(user_id);

CREATE TABLE IF NOT EXISTS board_watchers (
    board_id BIGINT REFERENCES boards(id) ON DELETE RESTRICT NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    /* UTC timestamp. */
    last_access timestamp NOT NULL DEFAULT now(),
    notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX board_watchers_board on board_watchers(board_id);
CREATE INDEX board_watchers_user_id on board_watchers(user_id);

/*
 * A list of all possible pseudonyms users can assume on the website.
 * These are generated through a script, and more can be added with time
 * (though older ones should stay unchanged). Once an identity is used for
 * the first time (and a avatar is generated) it should be stored for future use.
 *
 * Identities are only maintained on a per-thread basis, and each thread
 * should contain a mapping between user and identity for that thread.
 */
 /* TODO: choose better name. */
CREATE TABLE IF NOT EXISTS secret_identities 
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    display_text TEXT NOT NULL,
    /* Reference to the id of the image on external storage provider. */
    /* This can be null if generated on the fly*/
    avatar_reference_id TEXT
);

CREATE TABLE IF NOT EXISTS threads
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    parent_board BIGINT REFERENCES boards(id) ON DELETE RESTRICT NOT NULL,
    title TEXT NOT NULL
    /* TODO: decide what to do with threads with deleted posts */
);

/*
 * A mapping of which identity has been assigned to a user in each thread.
 */
CREATE TABLE IF NOT EXISTS user_thread_identities
(
    thread_id BIGINT REFERENCES threads(id) NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    identity_id BIGINT REFERENCES secret_identities(id) ON DELETE RESTRICT NOT NULL
);
CREATE INDEX user_thread_identities_thread_id on user_thread_identities(thread_id);

CREATE TABLE IF NOT EXISTS thread_watchers (
    thread_id BIGINT REFERENCES threads(id) ON DELETE RESTRICT NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    /* UTC timestamp. */
    last_access timestamp NOT NULL DEFAULT now(),
    notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX thread_watchers_thread_id on thread_watchers(thread_id);
CREATE INDEX thread_watchers_user_id on thread_watchers(user_id);

/* TODO: decide whether to switch this to who the user is visible to rather than hidden from. */
CREATE TYPE anonymity_type AS ENUM ('everyone', 'strangers');
CREATE TYPE post_type AS ENUM ('text');

CREATE TABLE IF NOT EXISTS posts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    string_id TEXT NOT NULL,
    parent_thread BIGINT REFERENCES threads(id) ON DELETE RESTRICT NOT NULL,
    author BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    /* UTC timestamp. */
    created timestamp NOT NULL DEFAULT now(),
    content TEXT NOT NULL,
    type post_type NOT NULL,
    /** 
     * Whisper Tags are textual tags that do not get indicized but act as an extra
     * space for comments
     */
    whisper_tags TEXT[],
    /* Mark deleted rather than actually delete for moderation purposes. */
    is_deleted BOOLEAN DEFAULT false,
    anonymity_type anonymity_type NOT NULL
);
CREATE INDEX post_string_id on posts(string_id);
CREATE INDEX post_parent_thread on posts(parent_thread);
CREATE INDEX post_author on posts(author);

CREATE TABLE IF NOT EXISTS post_tags (
    post_id BIGINT REFERENCES posts(id) ON DELETE RESTRICT NOT NULL,
    tag_id BIGINT REFERENCES tags(id) ON DELETE RESTRICT NOT NULL
);

CREATE TABLE IF NOT EXISTS post_audits (
    post_id BIGINT REFERENCES posts(id) ON DELETE RESTRICT NOT NULL,
    deleted_by BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    /* UTC timestamp. */
    deleted_time timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    parent_thread BIGINT REFERENCES threads(id) ON DELETE RESTRICT NOT NULL,
    parent_post BIGINT REFERENCES posts(id) ON DELETE RESTRICT NOT NULL,
    parent_comment BIGINT REFERENCES comments(id) ON DELETE RESTRICT,
    author BIGINT REFERENCES users(id) ON DELETE RESTRICT,
    /* UTC timestamp. */
    created timestamp NOT NULL DEFAULT now(),
    content TEXT NOT NULL,
    /* Reference to the id of the image on external storage provider. */
    image_reference_id TEXT,
    /* Mark deleted rather than actually delete for moderation purposes. */
    is_deleted BOOLEAN DEFAULT false,
    anonymity_type anonymity_type NOT NULL
);
CREATE INDEX comments_parent_thread on comments(parent_thread);
CREATE INDEX comments_author on comments(author);


CREATE TABLE IF NOT EXISTS comment_audits (
    comment_id BIGINT REFERENCES comments(id) ON DELETE RESTRICT NOT NULL,
    deleted_by BIGINT REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    /* UTC timestamp. */
    deleted_time timestamp NOT NULL DEFAULT now()
);