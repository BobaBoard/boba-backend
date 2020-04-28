import debug from "debug";
import pool from "../pool";

const log = debug("bobaserver:board:queries");

export const getBoardBySlug = async (slug: string): Promise<any> => {
  const query = `
    WITH board_threads AS
        (SELECT
        Threads.id as threads_id,
        Boards.title as boards_title,
        Threads.title as threads_title,
        *
        FROM Threads
        LEFT JOIN Boards ON Threads.parent_board = Boards.id
        WHERE Boards.slug=$1)
    SELECT DISTINCT ON (Posts.parent_thread)
    bt.boards_title as boardTitle,
    bt.description as boardDescription,
    bt.avatar_reference_id as boardAvatar,
    bt.slug as boardId,
    bt.threads_title as threadTitle,
    Posts.content as threadContent,
    Users.username as threadAuthor
    FROM board_threads AS bt
    LEFT JOIN Posts ON Posts.parent_thread = bt.threads_id
    LEFT JOIN Users ON Posts.author = Users.id
    ORDER BY Posts.parent_thread, Posts.created ASC`;

  try {
    const { rows } = await pool.query(query, [slug]);

    if (rows.length === 0) {
      log(`Board not found: ${slug}`);
      return null;
    }
    if (rows.length > 1) {
      // TODO: decide whether to throw
      log(
        `Error: found ${rows.length} boards while fetching board by slug (${slug}).`
      );
    }

    const result = rows[0];
    log(`Found board result ${result}`);
    return {
      title: result.boardtitle,
      description: result.boarddescription,
      avatar: result.boardavatar,
      slug: result.slug,
    };
  } catch (e) {
    log(`Error while fetching board by slug (${slug}).`);
    log(e);
    return null;
  }
};
