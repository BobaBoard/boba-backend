import { specs } from "../handlers/open-api.js";
import { writeFileSync } from "fs";

writeFileSync("open-api/open-api-spec.json", JSON.stringify(specs, null, 2), {
  flag: "w+",
});
