import debug from "debug";
import pool from "../pool";

const log = debug("bobaserver:admin:queries-log");
const error = debug("bobaserver:admin:queries-error");

export const createBoardsIfNotExists = async (
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
    log(
      `Added ${result.reduce(
        (value, row) => value + (row?.rowCount || 0),
        0
      )} records.`
    );
    return true;
  } catch (e) {
    error(`Error while adding new board.`);
    error(e);
    return false;
  }
};
