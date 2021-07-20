import { ITask } from "pg-promise";
import pool from "../server/db-pool";

export const runWithinTransaction = async (
  test: (transaction: ITask<any>) => void
) => {
  await pool.tx("test-transaction", async (t) => {
    await test(t);
    await t.none("ROLLBACK;");
  });
};
