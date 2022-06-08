import { ensureLoggedIn, withLoggedIn, withUserSettings } from "handlers/auth";
import express, { Express, Router } from "express";

import { DbThreadSummaryType } from "Types";
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
    !jest.isMockFunction(ensureLoggedIn) ||
    !jest.isMockFunction(withUserSettings)
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
  mocked(withUserSettings).mockImplementation((req, res, next) => {
    // @ts-ignore
    req.currentUser = { uid: firebaseId };
    next();
  });
};

export const setLoggedInUserWithEmail = (user: {
  uid: string;
  email: string;
}) => {
  if (
    !jest.isMockFunction(withLoggedIn) ||
    !jest.isMockFunction(ensureLoggedIn) ||
    !jest.isMockFunction(withUserSettings)
  ) {
    throw Error(
      "setLoggedInUserWithEmail requires 'handlers/auth' to be explicitly mocked."
    );
  }
  mocked(withLoggedIn).mockImplementation((req, res, next) => {
    // @ts-ignore
    req.currentUser = user;
    next();
  });
  mocked(ensureLoggedIn).mockImplementation((req, res, next) => {
    // @ts-ignore
    req.currentUser = user;
    next();
  });
  mocked(withUserSettings).mockImplementation((req, res, next) => {
    // @ts-ignore
    req.currentUser = user;
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

export const extractActivity = (thread: DbThreadSummaryType) => {
  return {
    thread_id: thread.thread_id,
    created: thread.created_at,
    thread_last_activity: thread.thread_last_activity,
    thread_last_activity_micro: thread.thread_last_activity_at_micro,
    post_id: thread.post_id,
    is_new: thread.is_new,
    threads_amount: thread.thread_direct_threads_amount,
    comments_amount: thread.thread_total_comments_amount,
    new_comments_amount: thread.thread_new_comments_amount,
    posts_amount: thread.thread_total_posts_amount,
    new_posts_amount: thread.thread_new_posts_amount,
  };
};

export const extractAuthorData = (thread: any) => {
  return {
    author: thread.author,
    friend: thread.friend,
    secret_identity_avatar: thread.secret_identity_avatar,
    secret_identity_name: thread.secret_identity_name,
    self: thread.self,
    user_avatar: thread.user_avatar,
    username: thread.username,
  };
};

export const extractsMetadata = (thread: any) => {
  return {
    content: thread.content,
    hidden: thread.hidden,
    default_view: thread.default_view,
    muted: thread.muted,
    starred: thread.starred,
    options: thread.options,
    parent_post_id: thread.parent_post_id,
    post_id: thread.post_id,
    index_tags: thread.index_tags,
    category_tags: thread.category_tags,
    content_warnings: thread.content_warnings,
    whisper_tags: thread.whisper_tags,
    board_slug: thread.board_slug,
    board_id: thread.board_id,
  };
};
