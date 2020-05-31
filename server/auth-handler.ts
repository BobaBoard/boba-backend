import firebaseAuth from "firebase-admin";
import { Request, Response, NextFunction } from "express";
import debug from "debug";

const log = debug("bobaserver:auth");

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
      log(decodedToken.uid);

      // @ts-ignore
      req.currentUser = decodedToken;
      next();
    })
    .catch((error) => {
      log("Error during verification, redirecting.");
      log(error);
      next();
    });
};
