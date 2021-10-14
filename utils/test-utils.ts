import { ensureLoggedIn, withLoggedIn } from "../handlers/auth";
import express, { Express, Router } from "express";

import { ITask } from "pg-promise";
import { Server } from "http";
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

export const startTestServer = (router: Router) => {
  const server: { app: Express | null } = { app: null };
  let listener: Server;
  beforeEach((done) => {
    server.app = express();
    server.app.use(router);
    listener = server.app.listen(4000, () => {
      done();
    });
  });
  afterEach((done) => {
    listener.close(done);
  });

  return server;
};
