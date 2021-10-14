import { ensureLoggedIn, withLoggedIn } from "../handlers/auth";

import { ITask } from "pg-promise";
import { mocked } from "ts-jest/utils";
import pool from "../server/db-pool";

export const runWithinTransaction = async (
  test: (transaction: ITask<any>) => void
) => {
  await pool.tx("test-transaction", async (t) => {
    await test(t);
    await t.none("ROLLBACK;");
  });
};

export const setLoggedInUser = (firebaseId: string) => {
  mocked(withLoggedIn).mockImplementation((req, res, next) => {
    // @ts-ignore
    req.currentUser = { uid: firebaseId };
    next();
  });
  mocked(ensureLoggedIn).mockImplementation((req, res, next) => {
    // @ts-ignore
    req.currentUser = { uid: firebaseId };
    next();
  });
};
