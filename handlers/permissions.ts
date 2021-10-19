import { NextFunction, Request, Response } from "express";

import { ThreadPermissions } from "types/permissions";
import { getUserPermissionsForThread } from "server/threads/queries";

declare global {
  namespace Express {
    export interface Request {
      currentThreadPermissions?: ThreadPermissions[];
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
      "Thread permissions can only be fetched on a route that includes a thread id"
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
          message: "User does not have required permissions.",
        });
        return;
      }
      next();
    });
  };
};
