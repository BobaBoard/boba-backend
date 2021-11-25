import {
  BoardMetadata,
  BoardSummary,
  LoggedInBoardMetadata,
} from "types/rest/boards";
import {
  BoardPermissions,
  PostPermissions,
  ThreadPermissions,
} from "types/permissions";

import { GenericResponse } from "../../types/rest/responses";

export const GORE_BOARD_ID = "c6d3d10e-8e49-4d73-b28a-9d652b41beec";
export const ANIME_BOARD_ID = "4b30fb7c-2aca-4333-aa56-ae8623a92b65";
export const MAIN_STREET_BOARD_ID = "2fb151eb-c600-4fe4-a542-4662487e5496";
export const MUTED_BOARD_ID = "2bdce2fa-12e0-461b-b0fb-1a2e67227434";
export const RESTRICTED_BOARD_ID = "76ebaab0-6c3e-4d7b-900f-f450625a5ed3";
export const LONG_BOARD_ID = "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83";
export const NULL_ID = "00000000-0000-0000-0000-000000000000";

export const extractBoardSummary = (metadata: BoardMetadata): BoardSummary => {
  const {
    id,
    realm_id,
    slug,
    avatar_url,
    tagline,
    accent_color,
    logged_in_only,
    delisted,
  } = metadata;
  return {
    id,
    realm_id,
    slug,
    avatar_url,
    tagline,
    accent_color,
    logged_in_only,
    delisted,
  };
};

const GORE_LOGGED_OUT_METADATA: BoardMetadata = {
  descriptions: [
    {
      description: '[{"insert": "pls b nice"}]',
      id: "51be2abf-d191-4269-830a-e0c51b9fd8e7",
      index: 1,
      title: "Gore description",
      type: "text",
    },
    {
      categories: ["blood", "bruises"],
      id: "e541f259-8e6a-42c9-84c3-9c8991945930",
      index: 2,
      title: "Gore Categories",
      type: "category_filter",
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

export const NULL_BOARD_NOT_FOUND: GenericResponse = {
  message:
    'The board with id "00000000-0000-0000-0000-000000000000" was not found.',
};
const RESTRICTED_LOGGED_OUT_BOARD_SUMMARY: BoardSummary = {
  id: RESTRICTED_BOARD_ID,
  realm_id: "v0-fake-id",
  avatar_url:
    "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2Fe4e263cf-ee98-4902-9c14-c10299210e01.png?alt=media&token=7c170411-9401-4d4e-9f66-5d6dfee2fccd",
  logged_in_only: true,
  delisted: false,
  accent_color: "#234a69",
  slug: "restricted",
  tagline: "A board to test for logged-in only view",
};

const RESTRICTED_BOBATAN_SUMMARY: BoardSummary = {
  id: RESTRICTED_BOARD_ID,
  realm_id: "v0-fake-id",
  avatar_url:
    "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2Fe4e263cf-ee98-4902-9c14-c10299210e01.png?alt=media&token=7c170411-9401-4d4e-9f66-5d6dfee2fccd",
  logged_in_only: true,
  delisted: false,
  accent_color: "#234a69",
  slug: "restricted",
  tagline: "A board to test for logged-in only view",
};

export const RESTRICTED_BOARD_SUMMARY = {
  LOGGED_OUT: RESTRICTED_LOGGED_OUT_BOARD_SUMMARY,
  BOBATAN: RESTRICTED_BOBATAN_SUMMARY,
};
Object.freeze(RESTRICTED_BOARD_SUMMARY);
