import { BoardMetadata, LoggedInBoardMetadata } from "types/rest/boards";
import { BoardPermissions, PostPermissions, ThreadPermissions } from "Types";

export const GORE_BOARD_ID = "c6d3d10e-8e49-4d73-b28a-9d652b41beec";

const GORE_LOGGED_OUT_METADATA: BoardMetadata = {
  descriptions: [
    {
      categories: ["blood", "bruises"],
      id: "id1",
      index: 2,
      title: "Gore Categories",
      type: "category_filter",
    },
    {
      description: '[{"insert": "pls b nice"}]',
      id: "id2",
      index: 1,
      title: "Gore description",
      type: "text",
    },
  ],
  accent_color: "#f96680",
  id: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
  slug: "gore",
  realm_id: "v0-fake-id",
  tagline: "Blood! Blood! Blood!",
  avatar_url: "/gore.png",
  delisted: false,
  logged_in_only: false,
};
const GORE_WITH_ROLE_METADATA: LoggedInBoardMetadata = {
  ...GORE_LOGGED_OUT_METADATA,
  muted: false,
  pinned: true,
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
  permissions: {
    board_permissions: [BoardPermissions.editMetadata],
    post_permissions: [
      PostPermissions.editCategoryTags,
      PostPermissions.editContentNotices,
    ],
    thread_permissions: [ThreadPermissions.moveThread],
  },
  posting_identities: [
    {
      id: "3df1d417-c36a-43dd-aaba-9590316ffc32",
      name: "The Owner",
      color: "pink",
      accessory:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F7c6c9459-7fa1-4d06-8dc0-ebb5b1bd76a8.png?alt=media&token=78d812a5-b217-4afb-99f3-41b9ed7b7ed5",
      avatar_url:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F2df7dfb4-4c64-4370-8e74-9ee30948f05d?alt=media&token=26b16bef-0fd2-47b5-b6df-6cf2799010ca",
    },
    {
      id: "e5f86f53-6dcd-4f15-b6ea-6ca1f088e62d",
      name: "GoreMaster5000",
      color: "red",
      accessory: null,
      avatar_url:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
    },
  ],
};
export const GORE_BOARD_METADATA = {
  LOGGED_OUT: GORE_LOGGED_OUT_METADATA,
  BOBATAN: GORE_WITH_ROLE_METADATA,
};
Object.freeze(GORE_BOARD_METADATA);
