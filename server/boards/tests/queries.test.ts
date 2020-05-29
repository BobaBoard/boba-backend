import "mocha";
import { expect } from "chai";

import { getBoards, getBoardBySlug, getBoardActivityBySlug } from "../queries";

describe("Tests boards queries", () => {
  it("fetches all boards", async () => {
    const boards = await getBoards();

    expect(boards.length).to.equal(3);
  });

  it("fetches board by slug when slug present", async () => {
    const board = await getBoardBySlug("gore");

    expect(board).to.eql({
      settings: {
        accentColor: "#f96680",
      },
      slug: "gore",
      tagline: "Blood! Blood! Blood!",
      threadsCount: "2",
      avatar: "gore.png",
    });
  });

  it("returns empty board when slugs not found", async () => {
    const board = await getBoardBySlug("this_will_not_be_in_the_db");

    expect(board).to.be.null;
  });

  it("fetches board activity when slug present", async () => {
    const board = await getBoardActivityBySlug("gore");

    expect(board).to.eql([
      {
        post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
        threads_id: "2",
        username: "bobatan",
        secret_identity: "Evil Moth",
        created: "2020-04-24T05:42:00",
        content: '[{"insert":"Favorite murder scene in videogames?"}]',
        posts_amount: "3",
        threads_amount: "2",
        comments_amount: "0",
        last_activity: "2020-04-30T09:47:00",
      },
      {
        post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
        threads_id: "1",
        username: "oncest5evah",
        secret_identity: "Evil Moth",
        created: "2020-04-30T03:23:00",
        content: '[{"insert":"Favorite character to maim?"}]',
        posts_amount: "3",
        threads_amount: "2",
        comments_amount: "0",
        last_activity: "2020-05-02T06:04:00",
      },
    ]);
  });
});
