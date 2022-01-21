import { ensureLoggedIn, withLoggedIn } from "handlers/auth";
import express, { Express, Router } from "express";

import { ITask } from "pg-promise";
import { Server } from "http";
import bodyParser from "body-parser";
import debug from "debug";
import { handleApiErrors } from "handlers/errors";
import { mocked } from "ts-jest/utils";
import pool from "server/db-pool";

require("express-async-errors");

const log = debug("bobaserver:tests:test-utils");

export const runWithinTransaction = async (
  test: (transaction: ITask<any>) => void
) => {
  await pool.tx("test-transaction", async (t) => {
    try {
      await test(t);
    } finally {
      await t.none("ROLLBACK;");
    }
  });
};

export const wrapWithTransaction = async (test: () => void) => {
  if (!jest.isMockFunction(pool.tx)) {
    throw Error(
      "wrapWithTransaction requires 'server/db-pool' to be explicitly mocked."
    );
  }
  try {
    log("starting transaction");
    await pool.none("BEGIN TRANSACTION;");
    await test();
  } finally {
    log("running cleanup");
    await pool.none("ROLLBACK;");
  }
};

export const setLoggedInUser = (firebaseId: string) => {
  if (
    !jest.isMockFunction(withLoggedIn) ||
    !jest.isMockFunction(ensureLoggedIn)
  ) {
    throw Error(
      "setLoggedInUser requires 'handlers/auth' to be explicitly mocked."
    );
  }
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
    server.app.use(bodyParser.json());
    // We add this middleware cause the server uses it in every request to check
    // logged in status.
    // TODO: extract middleware initialization in its own method and use it here
    // to keep these prerequisite in sync.
    server.app.use(withLoggedIn);
    server.app.use(router);
    server.app.use(handleApiErrors);
    listener = server.app.listen(4000, () => {
      done();
    });
  });
  afterEach((done) => {
    listener.close(done);
  });

  return server;
};
