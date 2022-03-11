import { QueryFile } from "pg-promise";
import path from "path";

export default {
  getUserFeedActivity: new QueryFile(
    path.join(__dirname, "user-feed-activity.sql")
  ),
  getBoardActivityByUuid: new QueryFile(
    path.join(__dirname, "board-activity-by-uuid.sql")
  ),
  getUserStarThreads: new QueryFile(
    path.join(__dirname, "star-feed-activity.sql")
  ),
};
