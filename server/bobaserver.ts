import express from "express";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const databaseConfig = { connectionString: process.env.DATABASE_URL };
const pool = new Pool(databaseConfig);

app.get("/boards", async (req, res) => {
  const boardId = req.query.boardId;

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
});
/*
app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);*/

export default app;
