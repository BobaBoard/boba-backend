import {
  BoardPermissions,
  BoardRestrictions,
  POST_OWNER_PERMISSIONS,
  PostPermissions,
  ThreadPermissions,
} from "types/permissions";
import { DbBoardMetadata, DbThreadType } from "Types";
import { NextFunction, Request, Response } from "express";
import {
  extractBoardPermissions,
  extractPostPermissions,
  getBoardRestrictions,
} from "utils/permissions-utils";
import {
  getThreadByStringId,
  getUserPermissionsForThread,
} from "server/threads/queries";

import { getBoardByUuid } from "server/boards/queries";
import { getPostFromStringId } from "server/posts/queries";

declare global {
  namespace Express {
    export interface Request {
      currentThreadPermissions?: ThreadPermissions[];
      currentThreadData?: DbThreadType;
      currentBoardPermissions?: BoardPermissions[];
      currentBoardMetadata?: DbBoardMetadata;
      currentBoardRestrictions?: {
        loggedOutRestrictions: BoardRestrictions[];
        loggedInBaseRestrictions: BoardRestrictions[];
      };
      currentPostPermissions?: PostPermissions[];
    }
  }
}

export const withThreadPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.thread_id) {
    throw new Error(
      "Thread permissions can only be fetched on a route that includes a thread id."
    );
  }
  if (!req.currentUser) {
    next();
    return;
  }

  const currentThreadPermissions = await getUserPermissionsForThread({
    firebaseId: req.currentUser.uid,
    threadId: req.params.thread_id,
  });

  if (!currentThreadPermissions) {
    next();
    return;
  }
  req.currentThreadPermissions = currentThreadPermissions;
  next();
};

export const ensureThreadPermission = (permission: ThreadPermissions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    withThreadPermissions(req, res, async () => {
      if (
        !req.currentThreadPermissions ||
        !req.currentThreadPermissions.includes(permission)
      ) {
        res.status(403).json({
          message:
            "User does not have required permissions for thread operation.",
        });
        return;
      }
      next();
    });
  };
};

export const ensureThreadAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const threadId = req.params.thread_id;
  const thread = await getThreadByStringId({
    threadId,
    firebaseId: req.currentUser?.uid,
  });

  if (!thread) {
    res
      .status(404)
      .send({ message: `The thread with id "${threadId}" was not found.` });
    return;
  }
  req.params.board_id = thread.board_id;
  req.currentThreadData = thread;
  ensureBoardAccess(req, res, next);
};

export const withBoardMetadata = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.board_id) {
    throw new Error(
      "Board permissions can only be fetched on a route that includes a board id."
    );
  }

  const boardId = req.params.board_id;
  const board = await getBoardByUuid({
    firebaseId: req.currentUser?.uid,
    boardId,
  });

  if (!board) {
    res
      .status(404)
      .send({ message: `The board with id "${boardId}" was not found.` });
    return;
  }

  req.currentBoardMetadata = board;
  req.currentBoardPermissions = extractBoardPermissions(board.permissions);
  req.currentBoardRestrictions = getBoardRestrictions({
    loggedOutRestrictions: board.logged_out_restrictions,
    loggedInBaseRestrictions: board.logged_in_base_restrictions,
  });
  next();
};

export const ensureBoardAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  withBoardMetadata(req, res, async () => {
    if (
      !req.currentUser &&
      req.currentBoardRestrictions.loggedOutRestrictions.includes(
        BoardRestrictions.LOCK_ACCESS
      )
    ) {
      res.status(401).json({
        message: "User must be authenticated to access board.",
      });
      return;
    }
    next();
  });
};

export const ensureBoardPermission = (permission: BoardPermissions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    withBoardMetadata(req, res, async () => {
      if (
        !req.currentBoardPermissions ||
        !req.currentBoardPermissions.includes(permission)
      ) {
        res.status(403).json({
          message:
            "User does not have required permissions for board operation.",
        });
        return;
      }
      next();
    });
  };
};

export const withPostPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.post_id) {
    throw new Error(
      "Thread permissions can only be fetched on a route that includes a thread id."
    );
  }
  if (!req.currentUser) {
    next();
    return;
  }

  const post = await getPostFromStringId(null, {
    firebaseId: req.currentUser.uid,
    postId: req.params.post_id,
  });
  if (!post) {
    res.status(404).send({
      message: `The post with id "${req.params.post_id}" was not found.`,
    });
    return;
  }
  if (post.is_own) {
    req.currentPostPermissions = POST_OWNER_PERMISSIONS;
    next();
    return;
  }
  const board = await getBoardByUuid({
    firebaseId: req.currentUser.uid,
    boardId: post.parent_board_id,
  });
  req.currentPostPermissions = extractPostPermissions(board.permissions);
  next();
};
