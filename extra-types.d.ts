import { auth } from "firebase-admin";

declare module "mocha" {
  export interface Suite {
    hsetStub: any;
    hgetStub: any;
  }
}

declare global {
  namespace Express {
    export interface Request {
      currentUser?: auth.DecodedIdToken;
    }
  }
}
