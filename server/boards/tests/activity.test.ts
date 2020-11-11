import "mocha";
import { expect } from "chai";

import { getBoardActivityBySlug } from "../queries";

describe("Tests boards activity queries", () => {
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
        author: "1",
        category_tags: [],
        comments_amount: 2,
        content:
          '[{"insert":"Remember to be excellent to each other and only be mean to fictional characters!"}]',
        content_warnings: [],
        created: "2020-09-25T05:42:00",
        friend: true,
        hidden: false,
        index_tags: [],
        is_new: true,
        default_view: "thread",
        muted: false,
        new_comments_amount: 2,
        new_posts_amount: 1,
        options: {},
        parent_post_id: null,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        secret_identity_avatar:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
        secret_identity_name: "GoreMaster5000",
        self: false,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity: "2020-10-02T05:43:00.000000",
        threads_amount: 0,
        user_avatar: "bobatan.png",
        username: "bobatan",
        whisper_tags: ["An announcement from your headmaster!"],
        board_slug: "gore",
      },
      {
        comments_amount: 2,
        content: '[{"insert":"Favorite character to maim?"}]',
        created: "2020-04-30T03:23:00",
        friend: false,
        is_new: false,
        thread_last_activity: "2020-05-23T05:52:00.000000",
        default_view: "thread",
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
        board_slug: "gore",
      },
      {
        comments_amount: 0,
        content: '[{"insert":"Favorite murder scene in videogames?"}]',
        created: "2020-04-24T05:42:00",
        friend: true,
        is_new: false,
        thread_last_activity: "2020-05-03T09:47:00.000000",
        default_view: "thread",
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
        board_slug: "gore",
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
        author: "1",
        category_tags: [],
        comments_amount: 2,
        content:
          '[{"insert":"Remember to be excellent to each other and only be mean to fictional characters!"}]',
        content_warnings: [],
        created: "2020-09-25T05:42:00",
        friend: false,
        hidden: false,
        index_tags: [],
        is_new: false,
        default_view: "thread",
        muted: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        options: {},
        parent_post_id: null,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        secret_identity_avatar:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
        secret_identity_name: "GoreMaster5000",
        self: false,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity: "2020-10-02T05:43:00.000000",
        threads_amount: 0,
        user_avatar: "bobatan.png",
        username: "bobatan",
        whisper_tags: ["An announcement from your headmaster!"],
        board_slug: "gore",
      },
      {
        comments_amount: 2,
        content: '[{"insert":"Favorite character to maim?"}]',
        created: "2020-04-30T03:23:00",
        friend: false,
        is_new: false,
        thread_last_activity: "2020-05-23T05:52:00.000000",
        default_view: "thread",
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
        board_slug: "gore",
      },
      {
        comments_amount: 0,
        content: '[{"insert":"Favorite murder scene in videogames?"}]',
        created: "2020-04-24T05:42:00",
        friend: false,
        is_new: false,
        thread_last_activity: "2020-05-03T09:47:00.000000",
        default_view: "thread",
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
        board_slug: "gore",
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
