import debug from "debug";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import firebaseAuth from "firebase-admin";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand(dotenv.config());

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH);

const firebaseApp = firebaseAuth.initializeApp({
  credential: firebaseAuth.credential.cert(serviceAccount),
});

import { applyRoutes } from "./all-routes";

const log = debug("bobaserver:main");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 4200;

applyRoutes(app);
app.set("json spaces", 2);

if (require.main === module) {
  app.listen(port, () =>
    log(
      process.env.NODE_ENV == "production"
        ? `Remote app started on port ${port}`
        : `Local app listening at http://localhost:${port}`
    )
  );
}

export default app;
