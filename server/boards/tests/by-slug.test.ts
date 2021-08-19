import "mocha";
import { expect } from "chai";

import { getBoardBySlug, getBoardActivityBySlug } from "../queries";

describe("Tests boards queries", () => {
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
          id: "id1",
          index: 2,
          title: "Gore Categories",
          type: "category_filter",
        },
        {
          categories: null,
          description: '[{"insert": "pls b nice"}]',
          id: "id2",
          index: 1,
          title: "Gore description",
          type: "text",
        },
      ],
      slug: "gore",
      tagline: "Blood! Blood! Blood!",
      avatar_url: "gore.png",
      // TODO: do we want to surface accessories for
      // non-logged in users?
      accessories: [
        {
          accessory: "/420accessories/weed_hands.png",
          id: 4,
          name: "Rolling",
        },
        {
          accessory: "/420accessories/joint.png",
          id: 5,
          name: "Joint",
        },
      ],
      muted: false,
      pinned_order: null,
      permissions: [],
      posting_identities: [],
      logged_in_base_restrictions: [],
      logged_out_restrictions: [],
    });
  });

  it("fetches board by slug when slug present (logged in)", async () => {
    const board = await getBoardBySlug({
      slug: "gore",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
    });

    expect(board).to.eql({
      settings: {
        accentColor: "#f96680",
      },
      descriptions: [
        {
          categories: ["blood", "bruises"],
          description: null,
          id: "id1",
          index: 2,
          title: "Gore Categories",
          type: "category_filter",
        },
        {
          categories: null,
          description: '[{"insert": "pls b nice"}]',
          id: "id2",
          index: 1,
          title: "Gore description",
          type: "text",
        },
      ],
      slug: "gore",
      tagline: "Blood! Blood! Blood!",
      avatar_url: "gore.png",
      muted: false,
      permissions: [
        "edit_board_details",
        "edit_category_tags",
        "edit_content_notices",
        "move_thread",
      ],
      pinned_order: "1",
      posting_identities: [
        {
          avatar_url:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F2df7dfb4-4c64-4370-8e74-9ee30948f05d?alt=media&token=26b16bef-0fd2-47b5-b6df-6cf2799010ca",
          id: "3df1d417-c36a-43dd-aaba-9590316ffc32",
          name: "The Owner",
          color: "pink",
          accessory:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F7c6c9459-7fa1-4d06-8dc0-ebb5b1bd76a8.png?alt=media&token=78d812a5-b217-4afb-99f3-41b9ed7b7ed5",
        },
        {
          avatar_url:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
          id: "e5f86f53-6dcd-4f15-b6ea-6ca1f088e62d",
          name: "GoreMaster5000",
          color: "red",
          accessory: null,
        },
      ],
      accessories: [
        {
          accessory: "/420accessories/weed_hands.png",
          id: 4,
          name: "Rolling",
        },
        {
          accessory: "/420accessories/joint.png",
          id: 5,
          name: "Joint",
        },
      ],
      logged_in_base_restrictions: [],
      logged_out_restrictions: [],
    });
  });

  it("returns null board when slugs not found", async () => {
    const board = await getBoardBySlug({
      slug: "this_will_not_be_in_the_db",
      firebaseId: undefined,
    });

    expect(board).to.be.null;
  });
});
