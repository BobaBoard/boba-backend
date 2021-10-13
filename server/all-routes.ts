import AdminRoutes from "./admin/routes";
import BoardsRoutes from "./boards/routes";
import FeedsRoutes from "./feeds/routes";
import PostsRoutes from "./posts/routes";
import RealsmRoutes from "./realms/routes";
import { Router } from "express";
import SubscriptionRoutes from "./subscriptions/routes";
import ThreadsRoutes from "./threads/routes";
import UsersRoutes from "./users/routes";
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
    router.use(`/${key}`, ROUTES[key]);
  });
};
