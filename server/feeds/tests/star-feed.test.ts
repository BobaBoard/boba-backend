import { extractActivity, extractsMetadata } from "utils/test-utils";

import { getUserStarFeed } from "../queries";

describe("user star feed queries", () => {
  test("bobatan star feed", async () => {
    const feed = await getUserStarFeed({
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
    });

    expect(feed.activity.map(extractsMetadata)).toEqual([]);
  });

  //TODO: add more items to jersey devil star feed
  test("jersey devil star feed", async () => {
    const feed = await getUserStarFeed({
      // jersey devil
      firebaseId: "fb2",
      cursor: null,
    });

    expect(feed.activity.map(extractsMetadata)).toEqual([
      {
        board_slug: "gore",
        post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
        parent_post_id: null,
        content: '[{"insert":"Favorite murder scene in videogames?"}]',
        default_view: "thread",
        muted: false,
        hidden: false,
        starred: true,
        index_tags: [],
        whisper_tags: ["mwehehehehe"],
        category_tags: ["blood", "bruises"],
        content_warnings: [],
      },
    ]);
  });
});
