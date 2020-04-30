import "mocha";
import { expect } from "chai";
import request from "supertest";

import { getBoardBySlug } from "../queries";

describe("Tests boards queries", () => {
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
});
