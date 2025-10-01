import { CacheKeys, cache } from "server/cache.js";
import { type NextFunction, type Request, type Response } from "express";
import firebaseAuth, { type auth } from "firebase-admin";

import { Internal500Error } from "handlers/api-errors/codes.js";
import { type SettingEntry } from "types/settings.js";
import debug from "debug";
import { getUserSettings } from "server/users/queries.js";
import opentelemetry from "@opentelemetry/api";
import stringify from "fast-json-stable-stringify";

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
      currentFirebaseUserData?: auth.UserRecord;
    }
  }
}

export const withLoggedIn = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idToken = req.headers?.authorization;
  delete req.currentUser;

  const activeSpan = opentelemetry.trace.getActiveSpan();

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
      activeSpan?.setAttribute("user.id", decodedToken.uid);
      log(`Found id token in request: ${decodedToken.uid}`);
      // @ts-ignore
      req.currentUser = decodedToken;
      if (process.env.NODE_ENV != "production" && process.env.FORCED_USER) {
        log(
          `Overriding user id with locally configured one (${process.env.FORCED_USER})`
        );
        log(`User email set as test@test.com`);
        // @ts-ignore
        req.currentUser.uid = process.env.FORCED_USER;
        req.currentUser.email = "test@test.com";
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
      if (e.errorInfo?.code == "auth/argument-error") {
        log("Found invalid authentication token: ", idToken);
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
        res.status(401).json({
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
    if (!req.currentUser) {
      next();
      return;
    }
    const currentUserId = req.currentUser.uid;
    const cachedData = await cache().hGet(
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
      await cache().hSet(
        CacheKeys.USER_SETTINGS,
        currentUserId,
        stringify(userSettings)
      );
    }
    next();
  });
};

// Leaving this commented out for now rather than deleting it entirely because it does return more info on the user than the decoded token in withLoggedIn does
// and I will be annoyed with myself if I delete it and need to remake it somewhere down the line.
// export const withFirebaseUserData = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   withLoggedIn(req, res, async () => {
//     const currentUserId = req.currentUser?.uid;
//     log("user:", currentUserId);
//     if (!currentUserId) {
//       next();
//       return;
//     }

//     if (process.env.NODE_ENV != "production" && process.env.FORCED_USER) {
//       log(`Bypassing firebaseAuth call and substituting test data`);
//       const firebaseUserData = { email: "test@test.com" };
//       if (!firebaseUserData) {
//         error(`Error while getting user data from firebase`);
//         throw new Internal500Error(`Failed to get user's firebase data`);
//       }
//       // @ts-ignore
//       req.currentFirebaseUserData = firebaseUserData;
//       next();
//       return;
//     }
//     const firebaseUserData = await firebaseAuth.auth().getUser(currentUserId);
//     log("firebaseUserData:", firebaseUserData);
//     if (!firebaseUserData) {
//       error(`Error while getting user data from firebase`);
//       throw new Internal500Error(`Failed to get user's firebase data`);
//     }
//     req.currentFirebaseUserData = firebaseUserData;
//     next();
//   });
// };
