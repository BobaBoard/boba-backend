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
      $1,
      $2)
    ON CONFLICT(display_name) DO NOTHING`;
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
      } else return pool.query(query, [name, avatar]);
    });
    const result = await Promise.all(promises);
    const recordsAdded = result.reduce(
      (value, row) => value + (row?.rowCount || 0),
      0
    );
    log(`Added ${recordsAdded} records.`);
    return recordsAdded;
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
  const query = `
      INSERT INTO boards(slug, tagline, avatar_reference_id, settings) VALUES (
        $1,
        $2,
        $3,
        $4)
      ON CONFLICT(slug) DO NOTHING`;

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
      } else
        return pool.query(query, [
          slug,
          tagline,
          avatar,
          {
            accentColor: accent,
          },
        ]);
    });
    const result = await Promise.all(promises);
    const recordsAdded = result.reduce(
      (value, row) => value + (row?.rowCount || 0),
      0
    );
    log(`Added ${recordsAdded} records.`);
    return recordsAdded;
  } catch (e) {
    error(`Error while adding new board.`);
    error(e);
    return false;
  }
};
