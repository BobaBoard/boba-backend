// import-sort-ignore
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
dotenvExpand(dotenv.config());

if (process.env.NODE_ENV == "production") {
  require("honeycomb-beeline")({
    // Get this via https://ui.honeycomb.io/account after signing up for Honeycomb
    writeKey: process.env.HONEYCOMB_API_KEY,
    // The name of your app is a good choice to start with
    dataset: "bobaserver",
    serviceName: "bobaboard-backend-service",
  });
}

import debug from "debug";
import express from "express";
import bodyParser from "body-parser";
import initOpenApiDocs from "../handlers/open-api";
import cors from "cors";
import firebaseAuth from "firebase-admin";
import { initCache } from "./cache";
import { withLoggedIn } from "../handlers/auth";
import { applyRoutes } from "./all-routes";

if (process.env.NODE_ENV == "production") {
  require("honeycomb-beeline")({
    // Get this via https://ui.honeycomb.io/account after signing up for Honeycomb
    writeKey: process.env.HONEYCOMB_API_KEY,
    // The name of your app is a good choice to start with
    dataset: "bobaserver",
    serviceName: "bobaboard-backend-service",
  });
}

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH);

if (!firebaseAuth.apps.length) {
  firebaseAuth.initializeApp({
    credential: firebaseAuth.credential.cert(serviceAccount),
  });
}
initCache();

const log = debug("bobaserver:main");

const app = express();
app.use(cors());
app.use(bodyParser.json());
initOpenApiDocs(app);
app.use(withLoggedIn);

const port = process.env.PORT || 4200;

applyRoutes(app);
app.set("json spaces", 2);
// @ts-expect-error
app.use((err, req, res, next) => {
  console.log(err);
});

if (require.main === module) {
  app.listen(port, () =>
    log(
      process.env.NODE_ENV == "production"
        ? `Remote app started on port ${port}`
        : `Local app listening at http://localhost:${port}`
    )
  );
}
process.on("uncaughtException", function (err) {
  console.log("uncaughtException caught the error");
});

export default app;
