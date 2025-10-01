import pgp from "pg-promise";
const { QueryFile } = pgp;
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  getRealmActivity: new QueryFile(path.join(__dirname, "realm-activity.sql")),
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
