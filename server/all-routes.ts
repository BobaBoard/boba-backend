import debug from "debug";
import { Router } from "express";
import BoardRoutes from "./boards/routes";
import ThreadRoutes from "./threads/routes";

const log = debug("bobaserver:all-routes");

const ROUTES: { [key: string]: Router } = {
  boards: BoardRoutes,
  threads: ThreadRoutes,
};

export const applyRoutes = (router: Router) => {
  Object.keys(ROUTES).forEach((key) => {
    log(`Adding new router for path /${key}`);
    router.use(`/${key}`, ROUTES[key]);
  });
};
