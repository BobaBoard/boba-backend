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
      log(`Founs id token in request: ${decodedToken.uid}`);
      // @ts-ignore
      req.currentUser = decodedToken;
      next();
    })
    .catch((e) => {
      error("Error during verification. No user set.");
      error(e);
      next();
    });
};
