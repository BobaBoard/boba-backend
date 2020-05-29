import debug from "debug";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
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
    console.log(`Example app listening at http://localhost:${port}`)
  );
}

export default app;
