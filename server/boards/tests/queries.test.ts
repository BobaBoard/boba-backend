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
        muted: false,
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
        muted: false,
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
        last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
        last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
        last_visit: null,
        muted: false,
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
        muted: false,
        settings: {
          accentColor: "#00b8ff",
        },
        slug: "long",
        tagline: "A board to test with many posts.",
        threads_count: "26",
      },
      {
        avatar_reference_id: "kink-meme.png",
        has_updates: false,
        last_comment: null,
        last_post: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
        last_visit: null,
        muted: false,
        settings: {
          accentColor: "#7b00ff",
        },
        slug: "memes",
        tagline: "A board to test collections view.",
        threads_count: "1",
      },
      {
        avatar_reference_id:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Feded338a-e0e5-4a97-a368-5ae525c0eec4?alt=media&token=914f84b7-a581-430e-bb09-695f653e8e02",
        has_updates: false,
        last_comment: null,
        last_post: null,
        last_visit: null,
        muted: false,
        settings: {
          accentColor: "#9b433b",
        },
        slug: "muted",
        tagline: "A board to test for muting.",
        threads_count: "1",
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
        muted: false,
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
        muted: false,
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
        last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
        last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
        last_visit: null,
        muted: false,
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
        muted: false,
        settings: {
          accentColor: "#00b8ff",
        },
        slug: "long",
        tagline: "A board to test with many posts.",
        threads_count: "26",
      },
      {
        avatar_reference_id: "kink-meme.png",
        has_updates: false,
        last_comment: null,
        last_post: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
        last_visit: null,
        muted: false,
        settings: {
          accentColor: "#7b00ff",
        },
        slug: "memes",
        tagline: "A board to test collections view.",
        threads_count: "1",
      },
      {
        avatar_reference_id:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Feded338a-e0e5-4a97-a368-5ae525c0eec4?alt=media&token=914f84b7-a581-430e-bb09-695f653e8e02",
        has_updates: false,
        last_comment: null,
        last_post: new Date(Date.UTC(2020, 0, 14, 8, 42)),
        last_visit: null,
        muted: false,
        settings: {
          accentColor: "#9b433b",
        },
        slug: "muted",
        tagline: "A board to test for muting.",
        threads_count: "1",
      },
    ]);
  });

  it("fetches all boards with dismissed notifications", async () => {
    const boards = await getBoards({
      // Zodiac Killer
      firebaseId: "fb5",
    });

    expect(boards).to.eql([
      {
        avatar_reference_id: "villains.png",
        has_updates: false,
        last_comment: null,
        last_post: null,
        last_visit: null,
        muted: false,
        settings: {
          accentColor: "#ff5252",
        },
        slug: "main_street",
        tagline: "For BobaBoard-related discussions.",
        threads_count: "0",
      },
      {
        avatar_reference_id: "gore.png",
        has_updates: true,
        last_comment: new Date(Date.UTC(2020, 4, 23, 12, 52)),
        last_post: new Date(Date.UTC(2020, 4, 3, 16, 47)),
        last_visit: null,
        muted: false,
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
        last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
        last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
        last_visit: new Date(Date.UTC(2020, 3, 26, 7, 0)),
        muted: false,
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
        last_visit: new Date(Date.UTC(2020, 3, 24, 7, 0)),
        muted: false,
        settings: {
          accentColor: "#00b8ff",
        },
        slug: "long",
        tagline: "A board to test with many posts.",
        threads_count: "26",
      },
      {
        avatar_reference_id: "kink-meme.png",
        has_updates: true,
        last_comment: null,
        last_post: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
        last_visit: null,
        muted: false,
        settings: {
          accentColor: "#7b00ff",
        },
        slug: "memes",
        tagline: "A board to test collections view.",
        threads_count: "1",
      },
      {
        avatar_reference_id:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Feded338a-e0e5-4a97-a368-5ae525c0eec4?alt=media&token=914f84b7-a581-430e-bb09-695f653e8e02",
        has_updates: false,
        last_comment: null,
        last_post: new Date(Date.UTC(2020, 0, 14, 8, 42)),
        last_visit: null,
        muted: false,
        settings: {
          accentColor: "#9b433b",
        },
        slug: "muted",
        tagline: "A board to test for muting.",
        threads_count: "1",
      },
    ]);
  });

  it("fetches board by slug when slug present", async () => {
    const board = await getBoardBySlug({ slug: "gore", firebaseId: undefined });

    expect(board).to.eql({
      settings: {
        accentColor: "#f96680",
      },
      descriptions: [
        {
          categories: ["blood", "bruises"],
          description: null,
          id: 1,
          index: 2,
          title: "Gore Categories",
          type: "category_filter",
        },
        {
          categories: null,
          description: '[{"insert": "pls b nice"}]',
          id: 2,
          index: 1,
          title: "Gore description",
          type: "text",
        },
      ],
      slug: "gore",
      tagline: "Blood! Blood! Blood!",
      avatar_reference_id: "gore.png",
      muted: false,
      permissions: [],
      posting_identities: [],
    });
  });

  it("returns empty board when slugs not found", async () => {
    const board = await getBoardBySlug({
      slug: "this_will_not_be_in_the_db",
      firebaseId: undefined,
    });

    expect(board).to.be.null;
  });

  it("fetches board activity when slug present (logged in)", async () => {
    const board = await getBoardActivityBySlug({
      slug: "gore",
      // Oncest
      firebaseId: "fb3",
      cursor: null,
    });

    if (board === false) {
      throw Error("Board activity fetching encountered an Error.");
    }

    expect(board.activity).to.eql([
      {
        comments_amount: 2,
        content: '[{"insert":"Favorite character to maim?"}]',
        created: "2020-04-30T03:23:00",
        friend: false,
        is_new: false,
        thread_last_activity: "2020-05-23T05:52:00.000000",
        last_comment: "2020-05-23T05:52:00",
        parent_post_id: null,
        new_comments_amount: 2,
        new_posts_amount: 0,
        post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
        posts_amount: 3,
        secret_identity_avatar:
          "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
        secret_identity_name: "DragonFucker",
        self: true,
        thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        threads_amount: 2,
        user_avatar: "greedler.jpg",
        author: "3",
        username: "oncest5evah",
        options: {},
        index_tags: [],
        whisper_tags: [],
        category_tags: [],
        content_warnings: [],
        muted: false,
        hidden: false,
      },
      {
        comments_amount: 0,
        content: '[{"insert":"Favorite murder scene in videogames?"}]',
        created: "2020-04-24T05:42:00",
        friend: true,
        is_new: false,
        thread_last_activity: "2020-05-03T09:47:00.000000",
        last_comment: null,
        new_comments_amount: 0,
        new_posts_amount: 1,
        post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
        posts_amount: 3,
        secret_identity_avatar:
          "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
        secret_identity_name: "DragonFucker",
        parent_post_id: null,
        self: false,
        thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
        threads_amount: 2,
        user_avatar: "bobatan.png",
        author: "1",
        username: "bobatan",
        options: {},
        index_tags: [],
        whisper_tags: ["mwehehehehe"],
        category_tags: [],
        content_warnings: [],
        muted: false,
        hidden: false,
      },
    ]);
  });

  it("fetches board activity when slug present (logged out)", async () => {
    const board = await getBoardActivityBySlug({
      slug: "gore",
      firebaseId: undefined,
      cursor: null,
    });

    if (board === false) {
      throw Error("Board activity fetching encountered an Error.");
    }

    expect(board.activity).to.eql([
      {
        comments_amount: 2,
        content: '[{"insert":"Favorite character to maim?"}]',
        created: "2020-04-30T03:23:00",
        friend: false,
        is_new: false,
        thread_last_activity: "2020-05-23T05:52:00.000000",
        last_comment: "2020-05-23T05:52:00",
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
        parent_post_id: null,
        posts_amount: 3,
        secret_identity_avatar:
          "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
        secret_identity_name: "DragonFucker",
        self: false,
        thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        threads_amount: 2,
        user_avatar: "greedler.jpg",
        author: "3",
        username: "oncest5evah",
        options: {},
        index_tags: [],
        whisper_tags: [],
        category_tags: [],
        content_warnings: [],
        muted: false,
        hidden: false,
      },
      {
        comments_amount: 0,
        content: '[{"insert":"Favorite murder scene in videogames?"}]',
        created: "2020-04-24T05:42:00",
        friend: false,
        is_new: false,
        thread_last_activity: "2020-05-03T09:47:00.000000",
        last_comment: null,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
        parent_post_id: null,
        posts_amount: 3,
        secret_identity_avatar:
          "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
        secret_identity_name: "DragonFucker",
        self: false,
        thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
        threads_amount: 2,
        user_avatar: "bobatan.png",
        author: "1",
        username: "bobatan",
        options: {},
        index_tags: [],
        whisper_tags: ["mwehehehehe"],
        category_tags: [],
        content_warnings: [],
        muted: false,
        hidden: false,
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

    if (board === false) {
      throw Error("Board activity fetching encountered an Error.");
    }

    expect(board.activity).to.eql([]);
  });
});
