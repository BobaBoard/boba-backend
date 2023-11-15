import { Comment, Contribution } from "types/open-api/generated/types";

export const CHARACTER_TO_MAIM_POST_ID = "11b85dac-e122-40e0-b09a-8829c5e0250e";
export const KERMIT_FRIEND_COMMENT_ID = "89fc3682-cb74-43f9-9a63-bd97d0f59bb9";

export const CHARACTER_TO_MAIM_POST: Contribution = {
  id: CHARACTER_TO_MAIM_POST_ID,
  content: '[{"insert":"Favorite character to maim?"}]',
  created_at: "2020-04-30T03:23:00.00Z",
  new: false,
  own: false,
  friend: false,
  new_comments_amount: 0,
  parent_post_id: null,
  parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
  secret_identity: {
    avatar:
      "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
    name: "DragonFucker",
    accessory:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F989f4b40-c1b8-4793-93dd-57e93df3e7ec.png?alt=media&token=cabdd8d5-b6a9-4914-bb59-eda4629f151b",
    color: null,
  },
  user_identity: null,
  total_comments_amount: 0,
  tags: {
    index_tags: ["evil", "bobapost"],
    whisper_tags: [],
    category_tags: ["bruises"],
    content_warnings: [],
  },
};

export const REVOLVER_OCELOT_POST: Contribution = {
  id: "619adf62-833f-4bea-b591-03e807338a8e",
  content: '[{"insert":"Revolver Ocelot"}]',
  created_at: "2020-05-01T05:42:00.00Z",
  new: false,
  own: false,
  friend: false,
  new_comments_amount: 0,
  parent_post_id: CHARACTER_TO_MAIM_POST_ID,
  parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
  secret_identity: {
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2F5c2c3867-2323-4209-8bd4-9dfcc88808f3%2Fd931f284-5c22-422d-9343-e509cfb44ffc.png?alt=media&token=94e52fff-4e6b-4110-94c3-90b8800f541c",
    name: "Old Time-y Anon",
    accessory:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
    color: null,
  },
  user_identity: null,
  total_comments_amount: 0,
  tags: {
    index_tags: ["evil", "oddly specific", "metal gear", "bobapost"],
    whisper_tags: ["fight me on this"],
    category_tags: [],
    content_warnings: [],
  },
};

export const KERMIT_COMMENTS: Comment[] = [
  {
    chain_parent_id: null,
    id: "afc72387-20e9-459d-afca-33ae7c581510",
    content: '[{"insert":"You\'re all weirdos (affectionate)"}]',
    created_at: "2020-05-02T06:06:00.00Z",
    friend: false,
    new: false,
    own: false,
    parent_comment_id: null,
    parent_post_id: "550337cb-3590-4252-9307-b922d17b9084",
    secret_identity: {
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2Fbe6d2b51-8192-4b78-a140-fecd1ec54f71?alt=media&token=4a13133b-f8fb-478b-9be4-22fa0f4a97c8",
      name: "The Prophet",
      accessory: null,
      color: null,
    },
    user_identity: null,
  },
  {
    content: '[{"insert":"OMG ME TOO"}]',
    created_at: "2020-05-22T00:22:00.00Z",
    id: "caa8b54a-eb5e-4134-8ae2-a3946a428ec7",
    chain_parent_id: null,
    new: false,
    own: false,
    friend: false,
    parent_post_id: "550337cb-3590-4252-9307-b922d17b9084",
    parent_comment_id: null,
    secret_identity: {
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2F5c2c3867-2323-4209-8bd4-9dfcc88808f3%2Fd931f284-5c22-422d-9343-e509cfb44ffc.png?alt=media&token=94e52fff-4e6b-4110-94c3-90b8800f541c",
      name: "Old Time-y Anon",
      accessory:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
      color: null,
    },
    user_identity: null,
  },
  {
    content: '[{"insert":"friends!!!!!"}]',
    created_at: "2020-05-23T05:52:00.00Z",
    id: KERMIT_FRIEND_COMMENT_ID,
    chain_parent_id: "caa8b54a-eb5e-4134-8ae2-a3946a428ec7",
    new: false,
    own: false,
    friend: false,
    parent_comment_id: null,
    parent_post_id: "550337cb-3590-4252-9307-b922d17b9084",
    secret_identity: {
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2F5c2c3867-2323-4209-8bd4-9dfcc88808f3%2Fd931f284-5c22-422d-9343-e509cfb44ffc.png?alt=media&token=94e52fff-4e6b-4110-94c3-90b8800f541c",
      name: "Old Time-y Anon",
      accessory:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
      color: null,
    },
    user_identity: null,
  },
];

export const KERMIT_POST: Contribution = {
  content: '[{"insert":"Kermit the Frog"}]',
  created_at: "2020-05-02T06:04:00.00Z",
  id: "550337cb-3590-4252-9307-b922d17b9084",
  new: false,
  own: false,
  friend: false,
  new_comments_amount: 0,
  parent_post_id: CHARACTER_TO_MAIM_POST_ID,
  parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
  secret_identity: {
    avatar:
      "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
    name: "DragonFucker",
    accessory:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F989f4b40-c1b8-4793-93dd-57e93df3e7ec.png?alt=media&token=cabdd8d5-b6a9-4914-bb59-eda4629f151b",
    color: null,
  },
  user_identity: null,
  total_comments_amount: KERMIT_COMMENTS.length,
  tags: {
    index_tags: ["good", "oddly specific", "bobapost"],
    whisper_tags: [
      "Im too ashamed to admit this ok",
      "sorry mom",
      "YOU WILL NEVER KNOW WHO I AM",
    ],
    category_tags: [],
    content_warnings: [],
  },
};

export const CANT_SEE_ME_POST: Contribution = {
  content: '[{"insert":"You can\'t see me!"}]',
  created_at: "2020-04-24T05:42:00.00Z",
  friend: false,
  id: "d1c0784b-0b72-40d0-801d-eb718b5ad011",
  new: true,
  new_comments_amount: 1,
  own: false,
  parent_post_id: null,
  parent_thread_id: "b3f4174e-c9e2-4f79-9d22-7232aa48744e",
  secret_identity: {
    accessory: null,
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F1237fd9e-cd40-41b8-8ee7-11c865f27b6b?alt=media&token=4bb418a6-cb45-435c-85ed-7bdcb294f5b5",
    color: null,
    name: "The OG OG Komaeda",
  },
  user_identity: null,
  tags: {
    category_tags: [],
    content_warnings: [],
    index_tags: [],
    whisper_tags: ["this is a test post"],
  },
  total_comments_amount: 1,
};
