import debug from "debug";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import express from "express";
import { applyRoutes } from "./all-routes";
import { Pool } from "pg";

const log = debug("bobaserver:main");

dotenvExpand(dotenv.config());
const DATABASE_URL = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@127.0.0.1:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

log(`DB url: ${DATABASE_URL}`);

const app = express();
const port = process.env.PORT || 3000;

const databaseConfig = { connectionString: DATABASE_URL };
const pool = new Pool(databaseConfig);

applyRoutes(app);

// app.get("/boards", async (req, res) => {
//   const boardId = req.query.boardId;

//   log(`Fetching data for board with id ${boardId}`);

//   try {
//     const { rows } = await pool.query(
//       `
//        WITH board_threads AS
//          (SELECT
//             Threads.id as threads_id,
//             Boards.title as boards_title,
//             Threads.title as threads_title,
//             *
//           FROM Threads
//           LEFT JOIN Boards ON Threads.parent_board = Boards.id
//           WHERE Boards.slug=$1)
//        SELECT DISTINCT ON (Posts.parent_thread)
//         bt.boards_title as boardTitle,
//         bt.description as boardDescription,
//         bt.avatar_reference_id as boardAvatar,
//         bt.slug as boardId,
//         bt.threads_title as threadTitle,
//         Posts.content as threadContent,
//         Users.username as threadAuthor
//       FROM board_threads AS bt
//         LEFT JOIN Posts ON Posts.parent_thread = bt.threads_id
//         LEFT JOIN Users ON Posts.author = Users.id
//       ORDER BY Posts.parent_thread, Posts.created ASC`,
//       [boardId]
//     );
//     res.send(rows);
//   } catch (e) {
//     log(`Error while fetching data for ${boardId}.`);
//     log(e);
//     res.sendStatus(500);
//   }
// });

if (require.main === module) {
  app.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
  );
}

export default app;
