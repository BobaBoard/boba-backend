// @ts-expect-error
import * as matchers from "jest-extended";

import debug from "debug";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand(dotenv.config());

expect.extend(matchers);

const log = debug("bobaserver:tests:setup");
beforeEach(() => {
  log("started test: ", expect.getState().currentTestName);
});
afterEach(() => {
  log("Finished test");
});
