import { QueryFile } from "pg-promise";
import path from "path";

export default {
  getUserFeedActivity: new QueryFile(
    path.join(__dirname, "user-feed-activity.sql")
  ),
  getBoardActivityByExternalId: new QueryFile(
    path.join(__dirname, "board-activity-by-external-id.sql")
  ),
  getUserStarThreads: new QueryFile(
    path.join(__dirname, "star-feed-activity.sql")
  ),
};
