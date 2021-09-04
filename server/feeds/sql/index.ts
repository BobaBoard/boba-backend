import { QueryFile } from "pg-promise";
import path from "path";

export default {
  getUserFeedActivity: new QueryFile(
    path.join(__dirname, "user-feed-activity.sql")
  ),
  getBoardActivityBySlug: new QueryFile(
    path.join(__dirname, "board-activity-by-slug.sql")
  ),
};
