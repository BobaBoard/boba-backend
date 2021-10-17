import { CacheKeys, cache } from "server/cache";
import { NextFunction, Request, Response } from "express";
import firebaseAuth, { auth } from "firebase-admin";

import { SettingEntry } from "../types/settings";
import debug from "debug";
import { getUserSettings } from "server/users/queries";

const log = debug("bobaserver:auth-log");
const error = debug("bobaserver:auth-error");

const EXPIRED_TOKEN_ERROR = "Authentication token expired.";
const NO_USER_FOUND_ERROR = "No authenticated user found.";
declare global {
  namespace Express {
    export interface Request {
      // Note: these should probably use req.locals, but that is harder to
      // type so the possible values will be suggested by the editor.
      currentUser?: auth.DecodedIdToken & { settings?: SettingEntry[] };
      authenticationError?: Error;
    }
  }
}

export const withLoggedIn = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idToken = req.headers?.authorization;
  req.currentUser = null;

  if (!idToken) {
    log("No id token found in request. User is not logged in.");
    req.authenticationError = new Error(NO_USER_FOUND_ERROR);
    next();
    return;
  }
  firebaseAuth
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      log(`Found id token in request: ${decodedToken.uid}`);
      // @ts-ignore
      req.currentUser = decodedToken;
      if (process.env.NODE_ENV != "production" && process.env.FORCED_USER) {
        log(
          `Overriding user id with locally configured one (${process.env.FORCED_USER})`
        );
        // @ts-ignore
        req.currentUser.uid = process.env.FORCED_USER;
      }
      next();
    })
    .catch((e) => {
      if (e.errorInfo?.code == "auth/id-token-expired") {
        log("Found expired authentication token.");
        req.authenticationError = new Error(EXPIRED_TOKEN_ERROR);
        next();
        return;
      }
      error("Error during verification. No user set.");
      error(e.errorInfo);
      error(idToken);
      req.authenticationError = new Error(
        `An uncommon authentication error occurred: ${e.errorInfo?.code}`
      );
      next();
      return;
    });
};

export const ensureLoggedIn = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  withLoggedIn(req, res, async () => {
    console.log(req.currentUser);
    const currentUserId = req.currentUser?.uid;
    if (!currentUserId) {
      error(
        `Unauthorized request received for ensureLoggedIn route: ${req.originalUrl}.`
      );
      error(req.authenticationError);
      if (req.authenticationError?.message === NO_USER_FOUND_ERROR) {
        res.status(401).json({
          message: NO_USER_FOUND_ERROR,
        });
      } else if (req.authenticationError?.message === EXPIRED_TOKEN_ERROR) {
        res.status(403).json({
          message: EXPIRED_TOKEN_ERROR,
        });
      } else {
        res.status(401).json({
          message: req.authenticationError?.message,
        });
      }
      return;
    }
    next();
  });
};

export const withUserSettings = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // First ensure that the isLoggedIn middleware is correctly called.
  withLoggedIn(req, res, async () => {
    const currentUserId = req.currentUser?.uid;
    if (!currentUserId) {
      next();
      return;
    }
    const cachedData = await cache().hget(
      CacheKeys.USER_SETTINGS,
      currentUserId
    );
    if (cachedData) {
      log(`Found cached settings data for user ${currentUserId}`);
      req.currentUser.settings = JSON.parse(cachedData);
    } else {
      const userSettings = await getUserSettings({ firebaseId: currentUserId });
      req.currentUser.settings = userSettings;
      log(`Retrieved user settings for user ${currentUserId}`);
      await cache().hset(
        CacheKeys.USER_SETTINGS,
        currentUserId,
        JSON.stringify(userSettings)
      );
    }
    next();
  });
};
