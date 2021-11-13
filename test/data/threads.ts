import {
  CANT_SEE_ME_POST,
  CHARACTER_TO_MAIM_POST,
  KERMIT_COMMENTS,
  KERMIT_POST,
  REVOLVER_OCELOT_POST,
} from "./posts";
import { GORE_BOARD_ID, RESTRICTED_BOARD_ID } from "./boards";
import { Thread, ThreadSummary } from "../../types/rest/threads";

export const EXCELLENT_THREAD_ID = "8b2646af-2778-487e-8e44-7ae530c2549c";
export const FAVORITE_CHARACTER_THREAD_ID =
  "29d1b2da-3289-454a-9089-2ed47db4967b";
export const FAVORITE_MURDER_THREAD_ID = "a5c903df-35e8-43b2-a41a-208c43154671";
export const RESTRICTED_THREAD_ID = "b3f4174e-c9e2-4f79-9d22-7232aa48744e";

export const EXCELLENT_THREAD_SUMMARY: ThreadSummary = {
  id: EXCELLENT_THREAD_ID,
  parent_board_slug: "gore",
  parent_board_id: GORE_BOARD_ID,
  starter: {
    id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
    parent_post_id: null,
    parent_thread_id: EXCELLENT_THREAD_ID,
    content:
      '[{"insert":"Remember to be excellent to each other and only be mean to fictional characters!"}]',
    created_at: "2020-09-25T05:42:00.00Z",
    new_comments_amount: 0,
    secret_identity: {
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
      name: "GoreMaster5000",
      accessory: null,
      color: "red",
    },
    own: false,
    friend: false,
    new: false,
    tags: {
      category_tags: [],
      content_warnings: ["harassment PSA"],
      index_tags: [],
      whisper_tags: ["An announcement from your headmaster!"],
    },
    // TODO[realms]: this is not accurate and should be rethought
    total_comments_amount: 0,
  },
  direct_threads_amount: 0,
  last_activity_at: "2020-10-04T05:44:00.00Z",
  new_comments_amount: 0,
  new_posts_amount: 0,
  total_comments_amount: 2,
  total_posts_amount: 1,
  muted: false,
  new: false,
  hidden: false,
  default_view: "thread",
};

export const FAVORITE_CHARACTER_THREAD_SUMMARY: ThreadSummary = {
  id: FAVORITE_CHARACTER_THREAD_ID,
  parent_board_slug: "gore",
  parent_board_id: GORE_BOARD_ID,
  starter: CHARACTER_TO_MAIM_POST,
  new_posts_amount: 0,
  new_comments_amount: 0,
  total_comments_amount: 2,
  total_posts_amount: 3,
  last_activity_at: KERMIT_COMMENTS[1].created_at,
  direct_threads_amount: 2,
  muted: false,
  hidden: false,
  new: false,
  default_view: "thread",
};

export const FAVORITE_MURDER_THREAD_SUMMARY: ThreadSummary = {
  id: FAVORITE_MURDER_THREAD_ID,
  parent_board_slug: "gore",
  parent_board_id: GORE_BOARD_ID,
  starter: {
    id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
    parent_thread_id: FAVORITE_MURDER_THREAD_ID,
    parent_post_id: null,
    created_at: "2020-04-24T05:42:00.00Z",
    content: '[{"insert":"Favorite murder scene in videogames?"}]',
    secret_identity: {
      name: "DragonFucker",
      avatar:
        "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
      accessory: null,
      color: null,
    },
    new: false,
    own: false,
    friend: false,
    tags: {
      index_tags: [],
      whisper_tags: ["mwehehehehe"],
      category_tags: ["blood", "bruises"],
      content_warnings: [],
    },
    total_comments_amount: 0,
    new_comments_amount: 0,
  },
  new_posts_amount: 0,
  new_comments_amount: 0,
  total_comments_amount: 0,
  total_posts_amount: 3,
  last_activity_at: "2020-05-03T09:47:00.00Z",
  direct_threads_amount: 2,
  muted: false,
  hidden: false,
  new: false,
  default_view: "thread",
};

export const RESTRICTED_THREAD_SUMMARY: ThreadSummary = {
  id: RESTRICTED_THREAD_ID,
  default_view: "thread",
  direct_threads_amount: 0,
  hidden: false,
  last_activity_at: "2020-04-24T05:44:00.00Z",
  muted: false,
  new: true,
  new_comments_amount: 1,
  new_posts_amount: 1,
  parent_board_id: RESTRICTED_BOARD_ID,
  parent_board_slug: "restricted",
  starter: CANT_SEE_ME_POST,
  total_comments_amount: 1,
  total_posts_amount: 1,
};

export const FAVORITE_CHARACTER_THREAD: Thread = {
  ...FAVORITE_CHARACTER_THREAD_SUMMARY,
  posts: [CHARACTER_TO_MAIM_POST, REVOLVER_OCELOT_POST, KERMIT_POST],
  comments: {
    [CHARACTER_TO_MAIM_POST.id]: [],
    [REVOLVER_OCELOT_POST.id]: [],
    [KERMIT_POST.id]: KERMIT_COMMENTS,
  },
};

export const RESTRICTED_THREAD: Thread = {
  ...RESTRICTED_THREAD_SUMMARY,
  posts: [CANT_SEE_ME_POST],
  comments: {
    [CANT_SEE_ME_POST.id]: [
      {
        chain_parent_id: null,
        content: '[{"insert":"MWAHAHAHAHAHAHHAHAHAHAHAHHAHAH!!!!!"}]',
        created_at: "2020-04-24T05:44:00.00Z",
        friend: false,
        id: "9c0300d9-b9f5-4dcf-874b-754b5f4e8ba9",
        new: true,
        own: false,
        parent_comment_id: null,
        parent_post_id: "b3f4174e-c9e2-4f79-9d22-7232aa48744e",
        secret_identity: {
          accessory: null,
          avatar:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F1237fd9e-cd40-41b8-8ee7-11c865f27b6b?alt=media&token=4bb418a6-cb45-435c-85ed-7bdcb294f5b5",
          color: null,
          name: "The OG OG Komaeda",
        },
      },
    ],
  },
};
