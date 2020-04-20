import debug from "debug";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import express from "express";
import { Pool } from "pg";

const log = debug("bobaserver:main");

dotenvExpand(dotenv.config());
const DATABASE_URL = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@127.0.0.1:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

log(`DB url: ${DATABASE_URL}`);

const app = express();
const port = process.env.PORT || 3000;

const databaseConfig = { connectionString: DATABASE_URL };
const pool = new Pool(databaseConfig);

app.get("/boards", async (req, res) => {
  const boardId = req.query.boardId;

  log(`Fetching data for board with id ${boardId}`);

  try {
    const { rows } = await pool.query(
      `SELECT
        Boards.title as boardTitle,
        Boards.description as boardDescription,
        Boards.avatar as boardAvatar,
        Boards.stringId as boardId,
        Threads.content as threadContent,
        Users.name as threadAuthor
      FROM Threads
        LEFT JOIN Boards ON Threads.parentBoard = Boards.id
        LEFT JOIN Users ON Threads.author = Users.id
      WHERE Boards.stringId=$1`,
      [boardId]
    );
    res.send(rows);
  } catch (e) {
    res.sendStatus(500);
  }
});

if (require.main === module) {
  app.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
  );
}

export default app;
