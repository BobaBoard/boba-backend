/*
 * A list of all possible pseudonyms users can assume on the website.
 * These are generated through a script, and more can be added with time
 * (though older ones should stay unchanged). Once an identity is used for
 * the first time (and a avatar is generated) it should be stored for future use.
 *
 * Identities are only maintained on a per-thread basis, and each thread
 * should contain a mapping between user and identity for that thread.
 */
CREATE TABLE IF NOT EXISTS secret_identities 
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    external_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    /* Reference to the id of the image on external storage provider. */
    avatar_reference_id TEXT NOT NULL
);
CREATE UNIQUE INDEX secret_identities_external_id on secret_identities(external_id);

CREATE TABLE IF NOT EXISTS bobadex_seasons
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    external_id TEXT NOT NULL,
    name TEXT NOT NULL
);
CREATE UNIQUE INDEX bobadex_seasons_external_id on bobadex_seasons(external_id);

CREATE TABLE IF NOT EXISTS bobadex_season_secret_identities
(
    bobadex_season_id BIGINT REFERENCES bobadex_seasons(id) ON DELETE RESTRICT NOT NULL,
    secret_identity_id BIGINT REFERENCES secret_identities(id) ON DELETE RESTRICT NOT NULL
    -- TODO: add index?
);
CREATE INDEX bobadex_season_secret_identities_bobadex_season_id on bobadex_season_secret_identities(bobadex_season_id);
CREATE INDEX bobadex_season_secret_identities_secret_identity_id on bobadex_season_secret_identities(secret_identity_id);
CREATE UNIQUE INDEX bobadex_season_secret_identities_entry on bobadex_season_secret_identities(bobadex_season_id, secret_identity_id);

CREATE TABLE IF NOT EXISTS realm_bobadex_seasons (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    realm_id BIGINT REFERENCES realms(id) ON DELETE RESTRICT NOT NULL,
    bobadex_season_id BIGINT REFERENCES bobadex_seasons(id) ON DELETE RESTRICT NOT NULL,
    active BOOLEAN NOT NULL
);
CREATE INDEX realm_bobadex_seasons_realm_id on realm_bobadex_seasons(realm_id);
CREATE UNIQUE INDEX realm_bobadex_seasons_entry on realm_bobadex_seasons(realm_id, bobadex_season_id);
