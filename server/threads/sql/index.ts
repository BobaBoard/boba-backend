import { QueryFile } from "pg-promise";
import path from "path";

export default {
  threadIdByString: new QueryFile(
    path.join(__dirname, "thread-by-string-id.sql")
  ),
  threadIdentitiesByStringId: new QueryFile(
    path.join(__dirname, "thread-identities-by-string-id.sql")
  ),
  visitThreadByStringId: new QueryFile(
    path.join(__dirname, "visit-thread-by-string-id.sql")
  ),
};
