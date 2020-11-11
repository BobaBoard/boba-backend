import "mocha";
import { expect } from "chai";

import { getBoards } from "../queries";

const extractBoardDetails = (boardData: any) => {
  return {
    avatar_reference_id: boardData.avatar_reference_id,
    settings: boardData.settings,
    slug: boardData.slug,
    tagline: boardData.tagline,
  };
};

const extractBoardUpdates = (boardData: any) => {
  return {
    slug: boardData.slug,
    has_updates: boardData.has_updates,
    last_comment: boardData.last_comment,
    last_post: boardData.last_post,
    last_visit: boardData.last_visit,
  };
};

const extractBoardUserSettings = (boardData: any) => {
  return {
    slug: boardData.slug,
    muted: boardData.muted,
    pinned_order: boardData.pinned_order,
  };
};

describe("Tests boards queries", () => {
  describe("Boards details", async () => {
    it("fetches boards details(with user)", async () => {
      const boards = await getBoards({
        // Bobatan
        firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      });

      expect(boards.map(extractBoardDetails)).to.eql([
        {
          avatar_reference_id: "villains.png",
          settings: {
            accentColor: "#ff5252",
          },
          slug: "main_street",
          tagline: "For BobaBoard-related discussions.",
        },
        {
          avatar_reference_id: "gore.png",
          settings: {
            accentColor: "#f96680",
          },
          slug: "gore",
          tagline: "Blood! Blood! Blood!",
        },
        {
          avatar_reference_id: "anime.png",
          settings: {
            accentColor: "#24d282",
          },
          slug: "anime",
          tagline: "I wish I had a funny one for this.",
        },
        {
          avatar_reference_id: "onceler-board.png",
          settings: {
            accentColor: "#00b8ff",
          },
          slug: "long",
          tagline: "A board to test with many posts.",
        },
        {
          avatar_reference_id: "kink-meme.png",
          settings: {
            accentColor: "#7b00ff",
          },
          slug: "memes",
          tagline: "A board to test collections view.",
        },
        {
          avatar_reference_id:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Feded338a-e0e5-4a97-a368-5ae525c0eec4?alt=media&token=914f84b7-a581-430e-bb09-695f653e8e02",
          settings: {
            accentColor: "#9b433b",
          },
          slug: "muted",
          tagline: "A board to test for muting.",
        },
      ]);
    });
  });

  describe("Boards updates", async () => {
    it("fetches all boards updates (with user)", async () => {
      const boards = await getBoards({
        // Bobatan
        firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      });

      expect(boards.map(extractBoardUpdates)).to.eql([
        {
          slug: "main_street",
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_visit: null,
        },
        {
          slug: "gore",
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 9, 2, 12, 43)),
          last_post: new Date(Date.UTC(2020, 8, 25, 12, 42)),
          last_visit: new Date(Date.UTC(2020, 4, 25, 16, 42)),
        },
        {
          slug: "anime",
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
          last_visit: null,
        },
        {
          slug: "long",
          has_updates: true,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_visit: null,
        },
        {
          slug: "memes",
          has_updates: false,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
          last_visit: null,
        },
        {
          slug: "muted",
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_visit: null,
        },
      ]);
    });
    it("fetches all boards updates (no user)", async () => {
      const boards = await getBoards({ firebaseId: undefined });

      expect(boards.map(extractBoardUpdates)).to.eql([
        {
          slug: "main_street",
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_visit: null,
        },
        {
          slug: "gore",
          has_updates: false,
          last_comment: new Date(Date.UTC(2020, 9, 2, 12, 43)),
          last_post: new Date(Date.UTC(2020, 8, 25, 12, 42)),
          last_visit: null,
        },
        {
          slug: "anime",
          has_updates: false,
          last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
          last_visit: null,
        },
        {
          slug: "long",
          has_updates: false,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_visit: null,
        },
        {
          slug: "memes",
          has_updates: false,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
          last_visit: null,
        },
        {
          slug: "muted",
          has_updates: false,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 0, 14, 8, 42)),
          last_visit: null,
        },
      ]);
    });

    it("fetches all boards updates (dismissed notifications)", async () => {
      const boards = await getBoards({
        // Zodiac Killer
        firebaseId: "fb5",
      });

      expect(boards.map(extractBoardUpdates)).to.eql([
        {
          slug: "main_street",
          has_updates: false,
          last_comment: null,
          last_post: null,
          last_visit: null,
        },
        {
          slug: "gore",
          has_updates: true,
          last_comment: new Date(Date.UTC(2020, 9, 2, 12, 43)),
          last_post: new Date(Date.UTC(2020, 8, 25, 12, 42)),
          last_visit: null,
        },
        {
          slug: "anime",
          has_updates: false,
          last_comment: new Date(Date.UTC(2020, 3, 24, 12, 44)),
          last_post: new Date(Date.UTC(2020, 3, 24, 12, 42)),
          last_visit: new Date(Date.UTC(2020, 3, 26, 7, 0)),
        },
        {
          slug: "long",
          has_updates: true,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 3, 25, 12, 42)),
          last_visit: new Date(Date.UTC(2020, 3, 24, 7, 0)),
        },
        {
          slug: "memes",
          has_updates: true,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 7, 22, 10, 36, 55, 850)),
          last_visit: null,
        },
        {
          slug: "muted",
          has_updates: false,
          last_comment: null,
          last_post: new Date(Date.UTC(2020, 0, 14, 8, 42)),
          last_visit: null,
        },
      ]);
    });
  });

  describe("User settings", async () => {
    it("fetches all boards (with user)", async () => {
      const boards = await getBoards({
        // Bobatan
        firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      });

      expect(boards.map(extractBoardUserSettings)).to.eql([
        {
          slug: "main_street",
          muted: false,
          pinned_order: null,
        },
        { slug: "gore", muted: false, pinned_order: "1" },
        { slug: "anime", muted: false, pinned_order: "2" },
        { slug: "long", muted: false, pinned_order: null },
        { slug: "memes", muted: false, pinned_order: null },
        { slug: "muted", muted: false, pinned_order: null },
      ]);
    });
    it("fetches all boards user settings (no user)", async () => {
      const boards = await getBoards({ firebaseId: undefined });

      expect(boards.map(extractBoardUserSettings)).to.eql([
        {
          slug: "main_street",
          muted: false,
          pinned_order: null,
        },
        { slug: "gore", muted: false, pinned_order: null },
        { slug: "anime", muted: false, pinned_order: null },
        { slug: "long", muted: false, pinned_order: null },
        { slug: "memes", muted: false, pinned_order: null },
        { slug: "muted", muted: false, pinned_order: null },
      ]);
    });
  });

  describe("When this fails, please update the tests above too", () => {
    it("fetches all boards (with user)", async () => {
      const boards = await getBoards({
        // Bobatan
        firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      });

      expect(boards[0]).to.eql({
        avatar_reference_id: "villains.png",
        has_updates: false,
        last_comment: null,
        last_post: null,
        last_visit: null,
        pinned_order: null,
        muted: false,
        settings: {
          accentColor: "#ff5252",
        },
        slug: "main_street",
        tagline: "For BobaBoard-related discussions.",
        threads_count: "0",
      });
    });
  });
});
