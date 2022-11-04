import { FAVORITE_CHARACTER_THREAD_ID, FAVORITE_MURDER_THREAD_ID } from "test/data/threads";
import { GORE_BOARD_ID, MAIN_STREET_BOARD_ID } from "test/data/boards";
import { extractActivity, extractAuthorData, extractsMetadata } from "utils/test-utils";

import { getBoardActivityByExternalId } from "../queries";

describe("Tests boards activity queries", () => {
  describe("tests activity metadata", () => {
    test("fetches board activity when slug present (logged in)", async () => {
      const board = await getBoardActivityByExternalId({
        boardExternalId: GORE_BOARD_ID,
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
          thread_id: FAVORITE_CHARACTER_THREAD_ID,
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
          thread_id: FAVORITE_MURDER_THREAD_ID,
          threads_amount: 2,
        },
      ]);
    });

    test("fetches board activity when slug present (logged out)", async () => {
      const board = await getBoardActivityByExternalId({
        boardExternalId: GORE_BOARD_ID,
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
          thread_id: FAVORITE_CHARACTER_THREAD_ID,
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
          thread_id: FAVORITE_MURDER_THREAD_ID,
          threads_amount: 2,
        },
      ]);
    });

    test("fetches empty board activity", async () => {
      const board = await getBoardActivityByExternalId({
        boardExternalId: MAIN_STREET_BOARD_ID,
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
      const board = await getBoardActivityByExternalId({
        boardExternalId: GORE_BOARD_ID,
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
          board_id: GORE_BOARD_ID,
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
          board_id: GORE_BOARD_ID,
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
          board_id: GORE_BOARD_ID,
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
      const board = await getBoardActivityByExternalId({
        boardExternalId: GORE_BOARD_ID,
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
          board_id: GORE_BOARD_ID,
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
          board_id: GORE_BOARD_ID,
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
          board_id: GORE_BOARD_ID,
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
      const board = await getBoardActivityByExternalId({
        boardExternalId: GORE_BOARD_ID,
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
      const board = await getBoardActivityByExternalId({
        boardExternalId: GORE_BOARD_ID,
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
