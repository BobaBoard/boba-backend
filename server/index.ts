import debug from "debug";
import express from "express";
import { applyRoutes } from "./all-routes";

const log = debug("bobaserver:main");

const app = express();
const port = process.env.PORT || 4200;

applyRoutes(app);

if (require.main === module) {
  app.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
  );
}

export default app;
