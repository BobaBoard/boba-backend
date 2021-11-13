import { DbThreadSummaryType } from "Types";
import { getBoardActivityBySlug } from "../queries";

export const extractActivity = (thread: DbThreadSummaryType) => {
  return {
    thread_id: thread.thread_id,
    created: thread.created,
    thread_last_activity: thread.thread_last_activity,
    thread_last_activity_micro: thread.thread_last_activity_at_micro,
    post_id: thread.post_id,
    is_new: thread.is_new,
    threads_amount: thread.thread_direct_threads_amount,
    comments_amount: thread.thread_total_comments_amount,
    new_comments_amount: thread.thread_new_comments_amount,
    posts_amount: thread.thread_total_posts_amount,
    new_posts_amount: thread.thread_new_posts_amount,
  };
};

export const extractsMetadata = (thread: any) => {
  return {
    content: thread.content,
    hidden: thread.hidden,
    default_view: thread.default_view,
    muted: thread.muted,
    starred: thread.starred,
    options: thread.options,
    parent_post_id: thread.parent_post_id,
    post_id: thread.post_id,
    index_tags: thread.index_tags,
    category_tags: thread.category_tags,
    content_warnings: thread.content_warnings,
    whisper_tags: thread.whisper_tags,
    board_slug: thread.board_slug,
  };
};

const extractAuthorData = (thread: any) => {
  return {
    author: thread.author,
    friend: thread.friend,
    secret_identity_avatar: thread.secret_identity_avatar,
    secret_identity_name: thread.secret_identity_name,
    self: thread.self,
    user_avatar: thread.user_avatar,
    username: thread.username,
  };
};

describe("Tests boards activity queries", () => {
  describe("tests activity metadata", () => {
    test("fetches board activity when slug present (logged in)", async () => {
      const board = await getBoardActivityBySlug({
        slug: "gore",
        // Oncest
        firebaseId: "fb3",
        cursor: null,
      });

      if (board === false) {
        throw Error("Board activity fetching encountered an Error.");
      }

      expect(board.activity.map(extractActivity)).toEqual([
        {
          comments_amount: 2,
          created: "2020-09-25T05:42:00.00Z",
          is_new: true,
          new_comments_amount: 2,
          new_posts_amount: 1,
          post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
          posts_amount: 1,
          thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
          thread_last_activity: "2020-10-04T05:44:00.00Z",
          thread_last_activity_micro: "2020-10-04T05:44:00.000000",
          threads_amount: 0,
        },
        {
          comments_amount: 2,
          created: "2020-04-30T03:23:00.00Z",
          is_new: false,
          thread_last_activity: "2020-05-23T05:52:00.00Z",
          thread_last_activity_micro: "2020-05-23T05:52:00.000000",
          new_comments_amount: 2,
          new_posts_amount: 0,
          post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          posts_amount: 3,
          thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
          threads_amount: 2,
        },
        {
          comments_amount: 0,
          created: "2020-04-24T05:42:00.00Z",
          is_new: false,
          thread_last_activity: "2020-05-03T09:47:00.00Z",
          thread_last_activity_micro: "2020-05-03T09:47:00.000000",
          new_comments_amount: 0,
          new_posts_amount: 1,
          post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          posts_amount: 3,
          thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
          threads_amount: 2,
        },
      ]);
    });

    test("fetches board activity when slug present (logged out)", async () => {
      const board = await getBoardActivityBySlug({
        slug: "gore",
        firebaseId: undefined,
        cursor: null,
      });

      if (board === false) {
        throw Error("Board activity fetching encountered an Error.");
      }

      expect(board.activity.map(extractActivity)).toEqual([
        {
          comments_amount: 2,
          created: "2020-09-25T05:42:00.00Z",
          new_comments_amount: 0,
          is_new: false,
          new_posts_amount: 0,
          post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
          posts_amount: 1,
          thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
          thread_last_activity: "2020-10-04T05:44:00.00Z",
          thread_last_activity_micro: "2020-10-04T05:44:00.000000",
          threads_amount: 0,
        },
        {
          comments_amount: 2,
          created: "2020-04-30T03:23:00.00Z",
          thread_last_activity: "2020-05-23T05:52:00.00Z",
          thread_last_activity_micro: "2020-05-23T05:52:00.000000",
          new_comments_amount: 0,
          is_new: false,
          new_posts_amount: 0,
          post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          posts_amount: 3,
          thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
          threads_amount: 2,
        },
        {
          comments_amount: 0,
          created: "2020-04-24T05:42:00.00Z",
          thread_last_activity: "2020-05-03T09:47:00.00Z",
          thread_last_activity_micro: "2020-05-03T09:47:00.000000",
          new_comments_amount: 0,
          is_new: false,
          new_posts_amount: 0,
          post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          posts_amount: 3,
          thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
          threads_amount: 2,
        },
      ]);
    });

    test("fetches empty board activity", async () => {
      const board = await getBoardActivityBySlug({
        slug: "main_street",
        // Bobatan
        firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
        cursor: null,
      });

      if (board === false) {
        throw Error("Board activity fetching encountered an Error.");
      }

      expect(board.activity).toEqual([]);
    });
  });

  describe("fetches metadata", () => {
    test("fetches board activity when slug present (logged in)", async () => {
      const board = await getBoardActivityBySlug({
        slug: "gore",
        // Oncest
        firebaseId: "fb3",
        cursor: null,
      });

      if (board === false) {
        throw Error("Board activity fetching encountered an Error.");
      }

      expect(board.activity.map(extractsMetadata)).toEqual([
        {
          parent_post_id: null,
          post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
          board_slug: "gore",
          content:
            '[{"insert":"Remember to be excellent to each other and only be mean to fictional characters!"}]',
          default_view: "thread",
          options: {},
          muted: false,
          hidden: false,
          starred: false,
          index_tags: [],
          category_tags: [],
          content_warnings: ["harassment PSA"],
          whisper_tags: ["An announcement from your headmaster!"],
        },
        {
          parent_post_id: null,
          post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          board_slug: "gore",
          content: '[{"insert":"Favorite character to maim?"}]',
          default_view: "thread",
          options: {},
          muted: false,
          hidden: false,
          starred: false,
          index_tags: ["evil", "bobapost"],
          category_tags: ["bruises"],
          content_warnings: [],
          whisper_tags: [],
        },
        {
          board_slug: "gore",
          post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          parent_post_id: null,
          content: '[{"insert":"Favorite murder scene in videogames?"}]',
          default_view: "thread",
          options: {},
          muted: false,
          hidden: false,
          starred: false,
          index_tags: [],
          whisper_tags: ["mwehehehehe"],
          category_tags: ["blood", "bruises"],
          content_warnings: [],
        },
      ]);
    });

    test("fetches board activity when slug present (logged out)", async () => {
      const board = await getBoardActivityBySlug({
        slug: "gore",
        firebaseId: undefined,
        cursor: null,
      });

      if (board === false) {
        throw Error("Board activity fetching encountered an Error.");
      }

      expect(board.activity.map(extractsMetadata)).toEqual([
        {
          parent_post_id: null,
          post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
          board_slug: "gore",
          content:
            '[{"insert":"Remember to be excellent to each other and only be mean to fictional characters!"}]',
          default_view: "thread",
          options: {},
          muted: false,
          hidden: false,
          starred: false,
          index_tags: [],
          category_tags: [],
          content_warnings: ["harassment PSA"],
          whisper_tags: ["An announcement from your headmaster!"],
        },
        {
          parent_post_id: null,
          post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          board_slug: "gore",
          content: '[{"insert":"Favorite character to maim?"}]',
          default_view: "thread",
          options: {},
          muted: false,
          hidden: false,
          starred: false,
          index_tags: ["evil", "bobapost"],
          category_tags: ["bruises"],
          content_warnings: [],
          whisper_tags: [],
        },
        {
          board_slug: "gore",
          post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          parent_post_id: null,
          content: '[{"insert":"Favorite murder scene in videogames?"}]',
          default_view: "thread",
          options: {},
          muted: false,
          hidden: false,
          starred: false,
          index_tags: [],
          whisper_tags: ["mwehehehehe"],
          category_tags: ["blood", "bruises"],
          content_warnings: [],
        },
      ]);
    });
  });

  describe("fetches author data", () => {
    test("fetches board activity when slug present (logged in)", async () => {
      const board = await getBoardActivityBySlug({
        slug: "gore",
        // Oncest
        firebaseId: "fb3",
        cursor: null,
      });

      if (board === false) {
        throw Error("Board activity fetching encountered an Error.");
      }

      expect(board.activity.map(extractAuthorData)).toEqual([
        {
          author: "1",
          friend: true,
          secret_identity_avatar:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
          secret_identity_name: "GoreMaster5000",
          self: false,
          user_avatar: "bobatan.png",
          username: "bobatan",
        },
        {
          friend: false,
          secret_identity_avatar:
            "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
          secret_identity_name: "DragonFucker",
          self: true,
          user_avatar: "greedler.jpg",
          author: "3",
          username: "oncest5evah",
        },
        {
          friend: true,
          secret_identity_avatar:
            "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
          secret_identity_name: "DragonFucker",
          user_avatar: "bobatan.png",
          self: false,
          author: "1",
          username: "bobatan",
        },
      ]);
    });

    test("fetches board activity when slug present (logged out)", async () => {
      const board = await getBoardActivityBySlug({
        slug: "gore",
        firebaseId: undefined,
        cursor: null,
      });

      if (board === false) {
        throw Error("Board activity fetching encountered an Error.");
      }

      expect(board.activity.map(extractAuthorData)).toEqual([
        {
          author: "1",
          friend: false,
          secret_identity_avatar:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
          secret_identity_name: "GoreMaster5000",
          self: false,
          user_avatar: "bobatan.png",
          username: "bobatan",
        },
        {
          friend: false,
          secret_identity_avatar:
            "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
          secret_identity_name: "DragonFucker",
          self: false,
          user_avatar: "greedler.jpg",
          author: "3",
          username: "oncest5evah",
        },
        {
          friend: false,
          secret_identity_avatar:
            "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
          secret_identity_name: "DragonFucker",
          self: false,
          user_avatar: "bobatan.png",
          author: "1",
          username: "bobatan",
        },
      ]);
    });
  });
});
