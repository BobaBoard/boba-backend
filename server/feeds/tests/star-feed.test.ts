import { extractActivity, extractsMetadata } from "./board-feed.test";

import { getUserStarFeed } from "../queries";

describe("user star feed queries", () => {
  test("bobatan star feed", async () => {
    const feed = await getUserStarFeed({
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
    });

    if (feed === false) {
      throw Error("User star feed fetching encountered an Error.");
    }

    expect(feed.activity.map(extractsMetadata)).toEqual([]);
  });
  test("jersey devil star feed", async () => {
    const feed = await getUserStarFeed({
      // jersey devil
      firebaseId: "fb2",
      cursor: null,
    });

    if (feed === false) {
      throw Error("User star feed fetching encountered an Error.");
    }

    expect(feed.activity.map(extractsMetadata)).toEqual([
      {
        board_slug: "gore",
        post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
        parent_post_id: null,
        content: '[{"insert":"Favorite murder scene in videogames?"}]',
        default_view: "thread",
        options: {},
        muted: false,
        hidden: false,
        starred: true,
        index_tags: [],
        whisper_tags: ["mwehehehehe"],
        category_tags: ["blood", "bruises"],
        content_warnings: [],
      }
    ]);
  });
});
