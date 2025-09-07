import {
  ensureLoggedIn,
  withLoggedIn,
  withUserSettings,
} from "handlers/auth.js";
import express, { type Express, type Router } from "express";

import { type ITask } from "pg-promise";
import { Server } from "http";
import { type ZodDbFeedType } from "types/db/schemas.js";
import bodyParser from "body-parser";
import debug from "debug";
import { handleApiErrors } from "handlers/api-errors/handler.js";

vi.mock("server/db-pool.js");
const pool = await import("server/db-pool.js").then((m) => m.default);

import "express-async-errors";

const log = debug("bobaserver:tests:test-utils");

export const runWithinTransaction = async (
  test: (transaction: ITask<any>) => void
) => {
  await pool.tx("test-transaction", async (t) => {
    try {
      await t.none("BEGIN TRANSACTION;");
      await test(t);
    } finally {
      await t.none("ROLLBACK;");
    }
  });
};

export const wrapWithTransaction = async (test: () => void) => {
  if (!vi.isMockFunction(pool.tx)) {
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
    !vi.isMockFunction(withLoggedIn) ||
    !vi.isMockFunction(ensureLoggedIn) ||
    !vi.isMockFunction(withUserSettings)
  ) {
    throw Error(
      "setLoggedInUser requires 'handlers/auth' to be explicitly mocked."
    );
  }
  vi.mocked(withLoggedIn).mockImplementation((req, _res, next) => {
    req.currentUser = { uid: firebaseId };
    next();
  });
  vi.mocked(ensureLoggedIn).mockImplementation((req, _res, next) => {
    req.currentUser = { uid: firebaseId };
    next();
  });
  vi.mocked(withUserSettings).mockImplementation((req, _res, next) => {
    req.currentUser = { uid: firebaseId };
    next();
  });
};

export const setLoggedInUserWithEmail = (user: {
  uid: string;
  email: string;
}) => {
  if (
    !vi.isMockFunction(withLoggedIn) ||
    !vi.isMockFunction(ensureLoggedIn) ||
    !vi.isMockFunction(withUserSettings)
  ) {
    throw Error(
      "setLoggedInUserWithEmail requires 'handlers/auth' to be explicitly mocked."
    );
  }
  vi.mocked(withLoggedIn).mockImplementation((req, _res, next) => {
    req.currentUser = user;
    next();
  });
  vi.mocked(ensureLoggedIn).mockImplementation((req, _res, next) => {
    req.currentUser = user;
    next();
  });
  vi.mocked(withUserSettings).mockImplementation((req, _res, next) => {
    req.currentUser = user;
    next();
  });
};

export const startTestServer = (router: Router) => {
  const server: { app: Express | null } = { app: null };
  let listener: Server;
  beforeEach(async () => {
    server.app = express();
    server.app.use(bodyParser.json());
    // We add this middleware cause the server uses it in every request to check
    // logged in status.
    // TODO: extract middleware initialization in its own method and use it here
    // to keep these prerequisite in sync.
    server.app.use(withLoggedIn);
    server.app.use(router);
    server.app.use(handleApiErrors);
    await new Promise((resolve) => {
      listener = server.app!.listen(4000, () => {
        resolve(true);
      });
    });
  });
  afterEach(async () => {
    if (listener) {
      await new Promise((resolve) => {
        listener.close(() => {
          resolve(true);
        });
      });
    }
  });

  return server;
};

export const extractActivity = (thread: ZodDbFeedType["activity"][0]) => {
  return {
    thread_id: thread.thread_id,
    created_at: thread.created_at,
    thread_last_activity_at: thread.thread_last_activity_at,
    thread_last_activity_at_micro: thread.thread_last_activity_at_micro,
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
