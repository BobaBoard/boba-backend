import debug from "debug";
import pool from "../pool";

const log = debug("bobaserver:board:queries-log");
const error = debug("bobaserver:board:queries-error");

export const getBoardBySlug = async (slug: string): Promise<any> => {
  const query = `
    SELECT 
        boards.slug,
        boards.title,
        boards.description,
        boards.avatar_reference_id,
        boards.settings,
        COUNT(threads.id) as threads_count
    FROM boards
    LEFT JOIN threads ON boards.id = threads.parent_board
    WHERE boards.slug=$1
    GROUP BY boards.id`;

  try {
    const { rows } = await pool.query(query, [slug]);

    if (rows.length === 0) {
      log(`Board not found: ${slug}`);
      return null;
    }
    if (rows.length > 1) {
      // TODO: decide whether to throw
      error(
        `Error: found ${rows.length} boards while fetching board by slug (${slug}).`
      );
    }

    const result = rows[0];
    log(`Got getBoardBySlug query result %O`, result);
    return {
      title: result.title,
      description: result.description,
      avatar: result.avatar_reference_id,
      settings: result.settings,
      slug: result.slug,
      threadsCount: result.threads_count,
    };
  } catch (e) {
    error(`Error while fetching board by slug (${slug}).`);
    error(e);
    return null;
  }
};
