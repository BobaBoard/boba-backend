// @ts-expect-error
import * as matchers from "jest-extended";

import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand(dotenv.config());

expect.extend(matchers);
