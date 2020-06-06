import debug from "debug";
import { Router } from "express";
import BoardsRoutes from "./boards/routes";
import ThreadsRoutes from "./threads/routes";
import PostsRoutes from "./posts/routes";
import UsersRoutes from "./users/routes";

const log = debug("bobaserver:all-routes");

const ROUTES: { [key: string]: Router } = {
  boards: BoardsRoutes,
  threads: ThreadsRoutes,
  posts: PostsRoutes,
  users: UsersRoutes,
};

export const applyRoutes = (router: Router) => {
  Object.keys(ROUTES).forEach((key) => {
    log(`Adding new router for path /${key}`);
    router.use(`/${key}`, ROUTES[key]);
  });
};
