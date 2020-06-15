import "mocha";
import { expect } from "chai";

import { getBoards, getBoardBySlug, getBoardActivityBySlug } from "../queries";

describe("Tests boards queries", () => {
  it("fetches all boards (with user)", async () => {
    const boards = await getBoards({
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
    });

    expect(boards).to.eql([
      {
        avatar_reference_id: "villains.png",
        has_updates: false,
        last_comment: null,
        last_post: null,
        last_visit: null,
        settings: {
          accentColor: "#ff5252",
        },
        slug: "main_street",
        tagline: "For BobaBoard-related discussions.",
        threads_count: "0",
      },
      {
        avatar_reference_id: "gore.png",
        has_updates: false,
        last_comment: new Date(Date.UTC(2020, 4, 23, 12, 52)),
        last_post: new Date(Date.UTC(2020, 4, 3, 16, 47)),
        last_visit: new Date(Date.UTC(2020, 4, 25, 16, 42)),
        settings: {
          accentColor: "#f96680",
        },
        slug: "gore",
        tagline: "Blood! Blood! Blood!",
        threads_count: "2",
      },
      {
        avatar_reference_id: "anime.png",
        has_updates: true,
        last_comment: null,
        last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
        last_visit: null,
        settings: {
          accentColor: "#24d282",
        },
        slug: "anime",
        tagline: "I wish I had a funny one for this.",
        threads_count: "1",
      },
      {
        avatar_reference_id: "onceler-board.png",
        has_updates: true,
        last_comment: null,
        last_post: new Date(Date.UTC(2020, 3, 25, 12, 42)),
        last_visit: null,
        settings: {
          accentColor: "#00b8ff",
        },
        slug: "long",
        tagline: "A board to test with many posts.",
        threads_count: "26",
      },
    ]);
  });

  it("fetches all boards (no user)", async () => {
    const boards = await getBoards({ firebaseId: undefined });

    expect(boards).to.eql([
      {
        avatar_reference_id: "villains.png",
        has_updates: false,
        last_comment: null,
        last_post: null,
        last_visit: null,
        settings: {
          accentColor: "#ff5252",
        },
        slug: "main_street",
        tagline: "For BobaBoard-related discussions.",
        threads_count: "0",
      },
      {
        avatar_reference_id: "gore.png",
        has_updates: false,
        last_comment: new Date(Date.UTC(2020, 4, 23, 12, 52)),
        last_post: new Date(Date.UTC(2020, 4, 3, 16, 47)),
        last_visit: null,
        settings: {
          accentColor: "#f96680",
        },
        slug: "gore",
        tagline: "Blood! Blood! Blood!",
        threads_count: "2",
      },
      {
        avatar_reference_id: "anime.png",
        has_updates: false,
        last_comment: null,
        last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
        last_visit: null,
        settings: {
          accentColor: "#24d282",
        },
        slug: "anime",
        tagline: "I wish I had a funny one for this.",
        threads_count: "1",
      },
      {
        avatar_reference_id: "onceler-board.png",
        has_updates: false,
        last_comment: null,
        last_post: new Date(Date.UTC(2020, 3, 25, 12, 42)),
        last_visit: null,
        settings: {
          accentColor: "#00b8ff",
        },
        slug: "long",
        tagline: "A board to test with many posts.",
        threads_count: "26",
      },
    ]);
  });

  it("fetches board by slug when slug present", async () => {
    const board = await getBoardBySlug("gore");

    expect(board).to.eql({
      settings: {
        accentColor: "#f96680",
      },
      slug: "gore",
      tagline: "Blood! Blood! Blood!",
      threads_count: "2",
      avatar_reference_id: "gore.png",
    });
  });

  it("returns empty board when slugs not found", async () => {
    const board = await getBoardBySlug("this_will_not_be_in_the_db");

    expect(board).to.be.null;
  });

  it("fetches board activity when slug present (logged in)", async () => {
    const board = await getBoardActivityBySlug({
      slug: "gore",
      // Oncest
      firebaseId: "fb3",
      cursor: null,
    });

    expect(board.activity).to.eql([
      {
        comments_amount: 2,
        content: '[{"insert":"Favorite character to maim?"}]',
        created: "2020-04-30T03:23:00",
        friend: false,
        is_new: false,
        last_activity: "2020-05-23T05:52:00",
        last_comment: new Date(Date.UTC(2020, 4, 23, 12, 52)),
        new_comments_amount: 2,
        new_posts_amount: 0,
        post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
        posts_amount: 3,
        secret_avatar:
          "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
        secret_identity: "DragonFucker",
        self: true,
        thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        threads_amount: 2,
        user_avatar: "greedler.jpg",
        user_id: "3",
        username: "oncest5evah",
      },
      {
        comments_amount: 0,
        content: '[{"insert":"Favorite murder scene in videogames?"}]',
        created: "2020-04-24T05:42:00",
        friend: true,
        is_new: false,
        last_activity: "2020-05-03T09:47:00",
        last_comment: null,
        new_comments_amount: 0,
        new_posts_amount: 1,
        post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
        posts_amount: 3,
        secret_avatar:
          "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
        secret_identity: "DragonFucker",
        self: false,
        thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
        threads_amount: 2,
        user_avatar: "bobatan.png",
        user_id: "1",
        username: "bobatan",
      },
    ]);
  });

  it("fetches board activity when slug present (logged out)", async () => {
    const board = await getBoardActivityBySlug({
      slug: "gore",
      firebaseId: undefined,
      cursor: null,
    });

    expect(board.activity).to.eql([
      {
        comments_amount: 2,
        content: '[{"insert":"Favorite character to maim?"}]',
        created: "2020-04-30T03:23:00",
        friend: false,
        is_new: false,
        last_activity: "2020-05-23T05:52:00",
        last_comment: new Date(Date.UTC(2020, 4, 23, 12, 52)),
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
        posts_amount: 3,
        secret_avatar:
          "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
        secret_identity: "DragonFucker",
        self: false,
        thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        threads_amount: 2,
        user_avatar: "greedler.jpg",
        user_id: "3",
        username: "oncest5evah",
      },
      {
        comments_amount: 0,
        content: '[{"insert":"Favorite murder scene in videogames?"}]',
        created: "2020-04-24T05:42:00",
        friend: false,
        is_new: false,
        last_activity: "2020-05-03T09:47:00",
        last_comment: null,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
        posts_amount: 3,
        secret_avatar:
          "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
        secret_identity: "DragonFucker",
        self: false,
        thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
        threads_amount: 2,
        user_avatar: "bobatan.png",
        user_id: "1",
        username: "bobatan",
      },
    ]);
  });

  it("fetches empty board activity", async () => {
    const board = await getBoardActivityBySlug({
      slug: "main_street",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
    });

    expect(board.activity).to.eql([]);
  });
});
