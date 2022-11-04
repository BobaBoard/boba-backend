import { BOBATAN_USER_ID, ZODIAC_KILLER_USER_ID } from "test/data/auth";

import { TWISTED_MINDS_REALM_STRING_ID } from "test/data/realms";
import { getBoards } from "../queries";

const extractBoardDetails = (boardData: any) => {
  return {
    avatar_reference_id: boardData.avatar_reference_id,
    settings: boardData.settings,
    slug: boardData.slug,
    uuid: boardData.string_id,
    realm_string_id: boardData.realm_string_id,
    tagline: boardData.tagline,
  };
};

const extractBoardUpdates = (boardData: any) => {
  return {
    slug: boardData.slug,
    uuid: boardData.string_id,
    realm_string_id: boardData.realm_string_id,
    has_updates: boardData.has_updates,
    last_comment: boardData.last_comment,
    last_post: boardData.last_post,
    last_visit: boardData.last_visit,
    last_activity: boardData.last_activity,
    last_activity_from_others: boardData.last_activity_from_others,
  };
};

const extractBoardUserSettings = (boardData: any) => {
  return {
    slug: boardData.slug,
    uuid: boardData.string_id,
    realm_string_id: boardData.realm_string_id,
    muted: boardData.muted,
    pinned_order: boardData.pinned_order,
  };
};

describe("Tests boards queries", () => {
  describe("Boards details", () => {
    test("fetches boards details(with user)", async () => {
      const boards = await getBoards({
        firebaseId: BOBATAN_USER_ID,
        realmExternalId: TWISTED_MINDS_REALM_STRING_ID,
      });

      expect(boards.map(extractBoardDetails)).toEqual([
        {
          avatar_reference_id: "villains.png",
          settings: {
            accentColor: "#ff5252",
          },
          slug: "main_street",
          uuid: "2fb151eb-c600-4fe4-a542-4662487e5496",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          tagline: "For BobaBoard-related discussions.",
        },
        {
          avatar_reference_id: "gore.png",
          settings: {
            accentColor: "#f96680",
          },
          slug: "gore",
          uuid: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          tagline: "Blood! Blood! Blood!",
        },
        {
          avatar_reference_id: "anime.png",
          settings: {
            accentColor: "#24d282",
          },
          slug: "anime",
          uuid: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          tagline: "I wish I had a funny one for this.",
        },
        {
          avatar_reference_id: "onceler-board.png",
          settings: {
            accentColor: "#00b8ff",
          },
          slug: "long",
          uuid: "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          tagline: "A board to test with many posts.",
        },
        {
          avatar_reference_id: "kink-meme.png",
          settings: {
            accentColor: "#7b00ff",
          },
          slug: "memes",
          uuid: "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          tagline: "A board to test collections view.",
        },
        {
          avatar_reference_id:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Feded338a-e0e5-4a97-a368-5ae525c0eec4?alt=media&token=914f84b7-a581-430e-bb09-695f653e8e02",
          settings: {
            accentColor: "#9b433b",
          },
          slug: "muted",
          uuid: "2bdce2fa-12e0-461b-b0fb-1a2e67227434",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          tagline: "A board to test for muting.",
        },
        {
          avatar_reference_id:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2Fe4e263cf-ee98-4902-9c14-c10299210e01.png?alt=media&token=7c170411-9401-4d4e-9f66-5d6dfee2fccd",
          settings: {
            accentColor: "#234a69",
          },
          slug: "restricted",
          uuid: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          tagline: "A board to test for logged-in only view",
        },
        {
          avatar_reference_id:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Fc3b86805-4df7-4b1a-9fa2-b96b5165a636?alt=media&token=7652d44a-38cb-40cc-82ef-908cd4265840",
          settings: {
            accentColor: "#fa8628",
          },
          slug: "delisted",
          uuid: "bb62b150-62ae-40a8-8ce2-7e5cdeae9d0b",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          tagline: "A board to test for link-only view",
        },
      ]);
    });
  });

  describe("Boards updates", () => {
    test("fetches all boards updates (with user)", async () => {
      const boards = await getBoards({
        firebaseId: BOBATAN_USER_ID,
        realmExternalId: TWISTED_MINDS_REALM_STRING_ID,
      });

      expect(boards.map(extractBoardUpdates)).toEqual([
        {
          slug: "main_street",
          uuid: "2fb151eb-c600-4fe4-a542-4662487e5496",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_activity: null,
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "gore",
          uuid: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 9, 4, 12, 44)),
          last_post: new Date(Date.UTC(2020, 8, 25, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 9, 4, 12, 44)),
          // Note: this will NOT be the same as last_comment, since that is from Bobatan
          last_activity_from_others: new Date(Date.UTC(2020, 9, 2, 12, 43)),
          last_visit: new Date(Date.UTC(2020, 4, 25, 16, 42)),
        },
        {
          slug: "anime",
          uuid: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_activity_from_others: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_visit: null,
        },
        {
          slug: "long",
          uuid: "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 3, 1, 12, 22)),
          last_post: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_activity_from_others: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_visit: null,
        },
        {
          slug: "memes",
          uuid: "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
          last_activity: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "muted",
          uuid: "2bdce2fa-12e0-461b-b0fb-1a2e67227434",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_activity: null,
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "restricted",
          uuid: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_activity_from_others: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_visit: null,
        },
        {
          slug: "delisted",
          uuid: "bb62b150-62ae-40a8-8ce2-7e5cdeae9d0b",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_activity: null,
          last_activity_from_others: null,
          last_visit: null,
        },
      ]);
    });
    test("fetches all boards updates (no user)", async () => {
      const boards = await getBoards({
        firebaseId: undefined,
        realmExternalId: TWISTED_MINDS_REALM_STRING_ID,
      });

      expect(boards.map(extractBoardUpdates)).toEqual([
        {
          slug: "main_street",
          uuid: "2fb151eb-c600-4fe4-a542-4662487e5496",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_activity: null,
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "gore",
          uuid: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: new Date(Date.UTC(2020, 9, 4, 12, 44)),
          last_post: new Date(Date.UTC(2020, 8, 25, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 9, 4, 12, 44)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "anime",
          uuid: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "long",
          uuid: "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: new Date(Date.UTC(2020, 3, 1, 12, 22)),
          last_post: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "memes",
          uuid: "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
          last_activity: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "muted",
          uuid: "2bdce2fa-12e0-461b-b0fb-1a2e67227434",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 0, 14, 8, 42)),
          last_activity: new Date(Date.UTC(2020, 0, 14, 8, 42)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "restricted",
          uuid: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "delisted",
          uuid: "bb62b150-62ae-40a8-8ce2-7e5cdeae9d0b",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_activity: null,
          last_activity_from_others: null,
          last_visit: null,
        },
      ]);
    });

    test("fetches all boards updates (dismissed notifications)", async () => {
      const boards = await getBoards({
        firebaseId: ZODIAC_KILLER_USER_ID,
        realmExternalId: TWISTED_MINDS_REALM_STRING_ID,
      });

      expect(boards.map(extractBoardUpdates)).toEqual([
        {
          slug: "main_street",
          uuid: "2fb151eb-c600-4fe4-a542-4662487e5496",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_activity: null,
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "gore",
          uuid: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 9, 4, 12, 44)),
          last_post: new Date(Date.UTC(2020, 8, 25, 12, 42)),
          // Note: this will be the same as last_comment, since that is from Bobatan
          last_activity: new Date(Date.UTC(2020, 9, 4, 12, 44)),
          last_activity_from_others: new Date(Date.UTC(2020, 9, 4, 12, 44)),
          last_visit: null,
        },
        {
          slug: "anime",
          uuid: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_activity_from_others: null,
          last_visit: new Date(Date.UTC(2020, 3, 26, 7, 0)),
        },
        {
          slug: "long",
          uuid: "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 3, 1, 12, 22)),
          last_post: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_activity_from_others: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_visit: new Date(Date.UTC(2020, 3, 24, 7, 0)),
        },
        {
          slug: "memes",
          uuid: "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: true,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
          last_activity: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
          last_activity_from_others: new Date(
            Date.UTC(2020, 7, 22, 10, 36, 55, 850)
          ),
          last_visit: null,
        },
        {
          slug: "muted",
          uuid: "2bdce2fa-12e0-461b-b0fb-1a2e67227434",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 0, 14, 8, 42)),
          last_activity: new Date(Date.UTC(2020, 0, 14, 8, 42)),
          last_activity_from_others: null,
          last_visit: null,
        },
        {
          slug: "restricted",
          uuid: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
          last_activity: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_activity_from_others: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_visit: null,
        },
        {
          slug: "delisted",
          uuid: "bb62b150-62ae-40a8-8ce2-7e5cdeae9d0b",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_activity: null,
          last_activity_from_others: null,
          last_visit: null,
        },
      ]);
    });
  });

  describe("User settings", () => {
    test("fetches all boards (with user)", async () => {
      const boards = await getBoards({
        firebaseId: BOBATAN_USER_ID,
        realmExternalId: TWISTED_MINDS_REALM_STRING_ID,
      });

      expect(boards.map(extractBoardUserSettings)).toEqual([
        {
          slug: "main_street",
          uuid: "2fb151eb-c600-4fe4-a542-4662487e5496",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: null,
        },
        {
          slug: "gore",
          uuid: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: "1",
        },
        {
          slug: "anime",
          uuid: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: "2",
        },
        {
          slug: "long",
          uuid: "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: null,
        },
        {
          slug: "memes",
          uuid: "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: null,
        },
        {
          slug: "muted",
          uuid: "2bdce2fa-12e0-461b-b0fb-1a2e67227434",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: null,
        },
        {
          slug: "restricted",
          uuid: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: null,
        },
        {
          slug: "delisted",
          uuid: "bb62b150-62ae-40a8-8ce2-7e5cdeae9d0b",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: null,
        },
      ]);
    });
    test("fetches all boards user settings (no user)", async () => {
      const boards = await getBoards({
        firebaseId: undefined,
        realmExternalId: TWISTED_MINDS_REALM_STRING_ID,
      });

      expect(boards.map(extractBoardUserSettings)).toEqual([
        {
          slug: "main_street",
          uuid: "2fb151eb-c600-4fe4-a542-4662487e5496",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: null,
        },
        {
          slug: "gore",
          uuid: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: null,
        },
        {
          slug: "anime",
          uuid: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: null,
        },
        {
          slug: "long",
          uuid: "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: null,
        },
        {
          slug: "memes",
          uuid: "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: null,
        },
        {
          slug: "muted",
          uuid: "2bdce2fa-12e0-461b-b0fb-1a2e67227434",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: null,
        },
        {
          slug: "restricted",
          uuid: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: null,
        },
        {
          slug: "delisted",
          uuid: "bb62b150-62ae-40a8-8ce2-7e5cdeae9d0b",
          realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
          muted: false,
          pinned_order: null,
        },
      ]);
    });
  });

  describe("When this fails, please update the tests above too", () => {
    // If this test fails it's because new fields have likely been added
    // that aren't tested by the above methods. Add the new field to the
    // appropriate "extration" method so it can be captured by the other tests.
    test("fetches all boards (with user)", async () => {
      const boards = await getBoards({
        firebaseId: BOBATAN_USER_ID,
        realmExternalId: TWISTED_MINDS_REALM_STRING_ID,
      });

      expect(boards[0]).toEqual({
        avatar_reference_id: "villains.png",
        has_updates: false,
        last_comment: null,
        last_post: null,
        last_visit: null,
        last_activity: null,
        last_activity_from_others: null,
        pinned_order: null,
        muted: false,
        settings: {
          accentColor: "#ff5252",
        },
        slug: "main_street",
        string_id: "2fb151eb-c600-4fe4-a542-4662487e5496",
        realm_string_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
        tagline: "For BobaBoard-related discussions.",
        logged_in_base_restrictions: [],
        logged_out_restrictions: [],
      });
    });
  });
});
