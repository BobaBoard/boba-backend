import debug from "debug";
import pool from "../pool";

const log = debug("bobaserver:admin:queries-log");
const error = debug("bobaserver:admin:queries-error");

export const createIdentitiesIfNotExist = async (
  identities: {
    avatar?: string;
    name?: string;
  }[]
) => {
  const query = `
    INSERT INTO secret_identities(display_name, avatar_reference_id) VALUES (
      $/display_name/,
      $/avatar_reference_id/)
    ON CONFLICT(display_name) DO UPDATE 
    SET avatar_reference_id = $/avatar_reference_id/
    WHERE secret_identities.display_name = $/display_name/`;
  try {
    const promises = identities.map(({ name, avatar }) => {
      log(`Attempting to insert identity: ${name}`);
      log(`data: `, {
        name,
        avatar,
      });
      if (!(name && avatar)) {
        log(`...data missing.`);
        return null;
      }
      return pool.none(query, {
        display_name: name,
        avatar_reference_id: avatar,
      });
    });
    const result = await Promise.all(promises);
    log(`Added identity records.`);
    return true;
  } catch (e) {
    error(`Error while adding new identities.`);
    error(e);
    return false;
  }
};

export const createBoardsIfNotExist = async (
  boards: {
    slug?: string;
    tagline?: string;
    avatar?: string;
    accent?: string;
  }[]
) => {
  // TODO: make this a transaction maybe?
  const query = `
      INSERT INTO boards(slug, tagline, avatar_reference_id, settings) VALUES (
        $/slug/,
        $/tagline/,
        $/avatar_reference_id/,
        $/settings/)
      ON CONFLICT(slug) DO UPDATE 
      SET tagline = $/tagline/,
          avatar_reference_id = $/avatar_reference_id/,
          settings = $/settings/
      WHERE boards.slug = $/slug/`;

  try {
    const promises = boards.map(({ slug, tagline, avatar, accent }) => {
      log(`Attempting to insert board: ${slug}`);
      log(`data: `, {
        slug,
        tagline,
        avatar,
        accent,
      });
      if (!(slug && tagline && avatar && accent)) {
        log(`...data missing.`);
        return null;
      }
      return pool.none(query, {
        slug,
        tagline,
        avatar_reference_id: avatar,
        settings: {
          accentColor: accent,
        },
      });
    });
    const result = await Promise.all(promises);
    log(`Added new board records.`);
    return true;
  } catch (e) {
    error(`Error while adding new board.`);
    error(e);
    return false;
  }
};
