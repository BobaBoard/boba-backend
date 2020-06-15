import "mocha";
import { expect } from "chai";

import { getBoardActivityBySlug } from "../queries";

describe("Tests boards queries", () => {
  it("fetches first page, gets cursor back", async () => {
    const boardActivity = await getBoardActivityBySlug({
      slug: "gore",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
    });
  });
});
