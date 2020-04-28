import BoardRoutes from "./boards/routes";
import { Router } from "express";

export const applyRoutes = (router: Router) => {
  router.use("/boards", BoardRoutes);
};
