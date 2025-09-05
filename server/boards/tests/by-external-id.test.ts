import { BOBATAN_USER_ID } from "test/data/auth";
import { BoardByExternalId } from "../sql/types";
import { GORE_BOARD_ID } from "test/data/boards";
import { TWISTED_MINDS_REALM_EXTERNAL_ID } from "test/data/realms";
import { getBoardByExternalId } from "../queries";

const GORE_BOARD_LOGGED_OUT: BoardByExternalId = {
  settings: {
    accentColor: "#f96680",
  },
  descriptions: [
    {
      description: '[{"insert": "pls b nice"}]',
      id: "51be2abf-d191-4269-830a-e0c51b9fd8e7",
      index: 1,
      title: "Gore description",
      type: "text",
      categories: null,
    },
    {
      categories: ["blood", "bruises"],
      description: null,
      id: "e541f259-8e6a-42c9-84c3-9c8991945930",
      index: 2,
      title: "Gore Categories",
      type: "category_filter",
    },
  ],
  slug: "gore",
  external_id: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
  tagline: "Blood! Blood! Blood!",
  avatar_url: "gore.png",
  realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
  // TODO: do we want to surface accessories for
  // non-logged in users?
  accessories: [
    {
      accessory: "/420accessories/weed_hands.png",
      id: "c82b99b4-9aa7-4792-8e6b-211edba5981e",
      name: "Rolling",
    },
    {
      accessory: "/420accessories/joint.png",
      id: "fc75cd7c-e6fa-4e82-af82-dc2d2e32ecae",
      name: "Joint",
    },
  ],
  muted: false,
  pinned_order: null,
  permissions: [],
  posting_identities: [],
  logged_in_base_restrictions: [],
  logged_out_restrictions: [],
};

const GORE_BOARD_LOGGED_IN: BoardByExternalId = {
  settings: {
    accentColor: "#f96680",
  },
  descriptions: [
    {
      categories: null,
      description: '[{"insert": "pls b nice"}]',
      id: "51be2abf-d191-4269-830a-e0c51b9fd8e7",
      index: 1,
      title: "Gore description",
      type: "text",
    },
    {
      categories: ["blood", "bruises"],
      description: null,
      id: "e541f259-8e6a-42c9-84c3-9c8991945930",
      index: 2,
      title: "Gore Categories",
      type: "category_filter",
    },
  ],
  slug: "gore",
  external_id: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
  tagline: "Blood! Blood! Blood!",
  avatar_url: "gore.png",
  realm_external_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
  muted: false,
  permissions: [
    "edit_board_details",
    "delete_board",
    "edit_category_tags",
    "edit_content_notices",
    "move_thread",
    "create_realm_invite",
    "view_roles_on_realm",
    "view_roles_on_board",
    "create_board_on_realm",
  ],
  pinned_order: 1,
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
      id: "c82b99b4-9aa7-4792-8e6b-211edba5981e",
      name: "Rolling",
    },
    {
      accessory: "/420accessories/joint.png",
      id: "fc75cd7c-e6fa-4e82-af82-dc2d2e32ecae",
      name: "Joint",
    },
  ],
  logged_in_base_restrictions: [],
  logged_out_restrictions: [],
};

describe("Tests boards queries", () => {
  test("fetches board by external id when external id present", async () => {
    const board = await getBoardByExternalId({
      boardExternalId: GORE_BOARD_ID,
      firebaseId: undefined,
    });

    expect(board).toEqual(GORE_BOARD_LOGGED_OUT);
  });

  test("fetches board by external id when external id present (logged in)", async () => {
    const board = await getBoardByExternalId({
      boardExternalId: GORE_BOARD_ID,
      firebaseId: BOBATAN_USER_ID,
    });

    expect(board).toEqual(GORE_BOARD_LOGGED_IN);
  });

  test("returns null board when external id not found", async () => {
    const board = await getBoardByExternalId({
      boardExternalId: "00000000-0000-0000-0000-000000000000",
      firebaseId: undefined,
    });

    expect(board).toBeNull();
  });
});
