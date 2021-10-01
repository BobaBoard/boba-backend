WITH ordered_identities AS
  (SELECT
    si.id id,
    ROW_NUMBER() OVER (ORDER BY si.id) AS index,
    bool_or(uti.user_id IS NOT NULL) caught,
    jsonb_build_object(
      'id', si.external_id,
      'index', ROW_NUMBER() OVER (ORDER BY si.id),
      'name', si.display_name,
      'avatar', si.avatar_reference_id) AS identity
  FROM secret_identities si
  LEFT JOIN user_thread_identities uti ON uti.identity_id = si.id AND uti.user_id = (SELECT id FROM users WHERE firebase_id = $/firebase_id/)
  GROUP BY si.id)
SELECT 
  bobadex_seasons.external_id id,
  bobadex_seasons.name,
  'v0' realm_id,
  COUNT(ordered_identities.*) identities_count,
  COALESCE(jsonb_agg(ordered_identities.identity) FILTER (WHERE ordered_identities.caught = TRUE), '[]') AS caught_identities
FROM bobadex_seasons
INNER JOIN bobadex_season_secret_identities
  ON bobadex_seasons.id = bobadex_season_secret_identities.bobadex_season_id
INNER JOIN ordered_identities
  ON ordered_identities.id = bobadex_season_secret_identities.secret_identity_id
GROUP BY bobadex_seasons.id, bobadex_seasons.external_id, bobadex_seasons.name;
