import { specs } from "../handlers/open-api";
import { writeFileSync } from "fs";

writeFileSync("open-api-spec.json", JSON.stringify(specs, null, 2), {
  flag: "w+",
});
