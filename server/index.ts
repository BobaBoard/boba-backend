// import-sort-ignore
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
dotenvExpand(dotenv.config());
import "./telemetry.js";

import express from "express";
import "express-async-errors";
import bodyParser from "body-parser";
import initOpenApiDocs from "handlers/open-api.js";
import cors from "cors";
import firebaseAuth from "firebase-admin";
import { initCache } from "./cache.js";
import { withLoggedIn } from "handlers/auth.js";
import { handleApiErrors } from "handlers/api-errors/handler.js";
import { applyRoutes } from "./all-routes.js";
import { registerEventHandlers } from "./event-handlers.js";

const serviceAccount = await import(
  process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH!
);

if (!firebaseAuth.apps.length) {
  firebaseAuth.initializeApp({
    credential: firebaseAuth.credential.cert(serviceAccount),
  });
}
initCache();

import debug from "debug";
const log = debug("bobaserver:main");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use((req, _res, next) => {
  log(`Received a request for path ${req.url}`);
  next();
});
initOpenApiDocs(app);
app.use(withLoggedIn);

const port = parseInt(process.env.BOBASERVER_PORT || "4200");

applyRoutes(app);
registerEventHandlers();
app.set("json spaces", 2);

app.use(handleApiErrors);

if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(port, () =>
    log(
      process.env.NODE_ENV == "production"
        ? `Remote app started on port ${port}`
        : `Local app listening at http://localhost:${port}`
    )
  );
}

export default app;
