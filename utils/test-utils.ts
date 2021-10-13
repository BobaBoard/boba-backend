import { ITask } from "pg-promise";
import pool from "../server/db-pool";

export const runWithinTransaction = async (
  test: (transaction: ITask<any>) => void
) => {
  await pool.tx("test-transaction", async (t) => {
    console.log("$$$$$$$$$$$");
    console.log("$$$$$$$$$$$");
    console.log("$$$$$$$$$$$");
    await test(t);
    console.log("$$$$$$$$$$$");
    console.log("$$$$$$$$$$$");
    console.log("$$$$$$$$$$$");
    console.log("$$$$$$$$$$$");
    console.log("$$$$$$$$$$$");
    await t.none("ROLLBACK;");
  });
};

export const wrapWithTransaction = async (test: () => void) => {
  await pool.none("BEGIN TRANSACTION;");
  await test();
  await pool.none("ROLLBACK;");
};
