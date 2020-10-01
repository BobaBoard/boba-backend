import firebaseAuth from "firebase-admin";
import { Request, Response, NextFunction } from "express";
import debug from "debug";

const log = debug("bobaserver:auth-log");
const error = debug("bobaserver:auth-error");

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  const idToken = req.headers?.authorization;
  if (!idToken) {
    log("No id token found in request. User is not logged in.");
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
      error("Error during verification. No user set.");
      //error(e);
      next();
    });
};
