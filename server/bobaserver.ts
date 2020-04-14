import express from "express";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const databaseConfig = { connectionString: process.env.DATABASE_URL };
const pool = new Pool(databaseConfig);

app.get("/", async (req, res) => {
  const {
    rows,
  } = await pool.query(
    "SELECT * FROM Threads LEFT JOIN Boards ON Threads.parentBoard = Boards.id WHERE Boards.stringId=$1",
    ["gore"]
  );
  res.send(rows);
});
/*
app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);*/

export default app;
