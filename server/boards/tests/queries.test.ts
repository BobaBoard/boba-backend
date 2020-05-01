import "mocha";
import { expect } from "chai";

import { getBoards, getBoardBySlug } from "../queries";

describe("Tests boards queries", () => {
  it("fetches all boards", async () => {
    const boards = await getBoards();

    expect(boards.length).to.equal(3);
  });

  it("fetches board by slug when slug present", async () => {
    const board = await getBoardBySlug("gore");

    expect(board).to.eql({
      title: "Gore Central",
      description: "Everything the light touches is dead doves.",
      avatar: null,
      slug: "gore",
      threadsCount: "2",
      settings: {},
    });
  });

  it("returns empty board when slugs not found", async () => {
    const board = await getBoardBySlug("this_will_not_be_in_the_db");

    expect(board).to.be.null;
  });
});
