// @ts-expect-error
import * as matchers from "jest-extended";

import debug from "debug";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand(dotenv.config());

expect.extend(matchers);

const log = debug("bobaserver:tests:setup");
beforeEach(() => {
  log("*");
  log("*");
  log("***************");
  log("started test: ", expect.getState().currentTestName);
  log("***************");
});
afterEach(() => {
  log("***************");
  log("Finished test", expect.getState().currentTestName);
  log("***************");
  log("*");
  log("*");
});
