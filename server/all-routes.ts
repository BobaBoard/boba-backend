import AdminRoutes from "./admin/routes.js";
import BoardsRoutes from "./boards/routes.js";
import FeedsRoutes from "./feeds/routes.js";
import PostsRoutes from "./posts/routes.js";
import RealsmRoutes from "./realms/routes.js";
import { type Router } from "express";
import SubscriptionRoutes from "./subscriptions/routes.js";
import ThreadsRoutes from "./threads/routes.js";
import UsersRoutes from "./users/routes.js";
import debug from "debug";

const log = debug("bobaserver:all-routes");

const ROUTES: { [key: string]: Router } = {
  boards: BoardsRoutes,
  threads: ThreadsRoutes,
  posts: PostsRoutes,
  users: UsersRoutes,
  admin: AdminRoutes,
  subscriptions: SubscriptionRoutes,
  realms: RealsmRoutes,
  feeds: FeedsRoutes,
};

export const applyRoutes = (router: Router) => {
  Object.keys(ROUTES).forEach((key) => {
    log(`Adding new router for path /${key}`);
    router.use(`/${key}`, ROUTES[key]!);
  });
};
