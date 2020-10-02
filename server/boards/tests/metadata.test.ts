import "mocha";
import { expect } from "chai";

import { getMetadataDelta } from "../utils";

describe("Tests delta metadata", async () => {
  it("gets correct amounts with no visit", async () => {
    const delta = getMetadataDelta({
      oldMetadata: {
        slug: "gore",
        accentColor: "red",
        avatarUrl: "this_is_a_url",
        tagline: "The tagline!",
        descriptions: [
          {
            id: 1,
            index: 1,
            title: "title1",
            type: "text",
            description: "desc1",
          },
          {
            id: 2,
            index: 2,
            title: "title2",
            type: "category_filter",
            categories: ["cat21", "cat22"],
          },
          {
            id: 3,
            index: 3,
            title: "title3",
            type: "category_filter",
            categories: ["cat31", "cat32", "cat33"],
          },
          {
            id: 4,
            index: 4,
            title: "title4",
            type: "text",
            description: "desc4",
          },
          {
            id: 5,
            index: 5,
            title: "title5",
            type: "category_filter",
            categories: ["cat51", "cat52", "cat53"],
          },
        ],
      },
      newMetadata: {
        descriptions: [
          {
            id: 1,
            index: 1,
            title: "title1",
            type: "text",
            description: "desc1",
          },
          {
            id: 6,
            index: 2,
            title: "title6",
            type: "text",
            description: "desc6",
          },
          {
            id: 3,
            index: 3,
            title: "title3",
            type: "category_filter",
            categories: ["cat31", "cat33"],
          },
          {
            id: 4,
            index: 4,
            title: "title4",
            type: "text",
            description: "a new description",
          },
          {
            id: 5,
            index: 5,
            title: "title5",
            type: "category_filter",
            categories: ["cat51", "cat52", "cat53", "cat54"],
          },
        ],
      },
    });

    expect(delta).to.eql({
      texts: {
        deleted: [],
        newAndUpdated: [
          {
            id: 1,
            index: 1,
            title: "title1",
            type: "text",
            description: "desc1",
          },
          {
            id: 6,
            index: 2,
            title: "title6",
            type: "text",
            description: "desc6",
          },
          {
            id: 4,
            index: 4,
            title: "title4",
            type: "text",
            description: "a new description",
          },
        ],
      },
      categoryFilters: {
        deleted: [{ id: 2 }],
        newAndUpdated: [
          {
            id: 3,
            index: 3,
            title: "title3",
            type: "category_filter",
            categories: {
              deleted: ["cat32"],
              new: [],
            },
          },
          {
            id: 5,
            index: 5,
            title: "title5",
            type: "category_filter",
            categories: {
              deleted: [],
              new: ["cat54"],
            },
          },
        ],
      },
    });
  });
});
