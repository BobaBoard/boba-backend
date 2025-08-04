import { REALM_MEMBER_PERMISSIONS, RealmPermissions } from "types/permissions";

import { UserData } from "../../types/rest/user";

export const BOBATAN_USER_DATA: UserData = {
  avatar_url: "/bobatan.png",
  username: "bobatan",
};

export const BOBATAN_PINNED_BOARDS = {
  pinned_boards: {
    anime: {
      accent_color: "#24d282",
      avatar_url: "/anime.png",
      delisted: false,
      id: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
      index: 2,
      logged_in_only: false,
      muted: false,
      pinned: true,
      realm_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
      slug: "anime",
      tagline: "I wish I had a funny one for this.",
    },
    gore: {
      accent_color: "#f96680",
      avatar_url: "/gore.png",
      delisted: false,
      id: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
      index: 1,
      logged_in_only: false,
      muted: false,
      pinned: true,
      realm_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
      slug: "gore",
      tagline: "Blood! Blood! Blood!",
    },
  },
};

export const ONCEST_USER_IDENTITY = {
  avatar: "/greedler.jpg",
  name: "oncest5evah",
};

export const BOBATAN_TWISTED_MINDS_REALM_PERMISSIONS = [
  RealmPermissions.createRealmInvite,
  RealmPermissions.viewRolesOnRealm,
  RealmPermissions.createBoard,
  ...REALM_MEMBER_PERMISSIONS,
];

// TODO: the realm_id for JERSEY_DEVIL_BOBADEX should not be v0, it should be the external_id of the realm (a UUID) - fix this when the relevant changes have been made elsewhere in the project (which will ideally make relevant tests fail)
// TODO: identities_count for JERSEY_DEVIL_BOBADEX should be a number - fix this when changes have been made elsewhere (ideally making relevant tests fail)
export const JERSEY_DEVIL_BOBADEX = {
  seasons: [
    {
      id: "9f6d41a5-1e00-4071-9f50-555f1686f87f",
      name: "Default",
      realm_id: "v0",
      identities_count: "3",
      caught_identities: [
        {
          id: "85e33a3c-f987-41fd-a555-4c0cfdedf737",
          name: "Old Time-y Anon",
          index: 1,
          avatar:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2F5c2c3867-2323-4209-8bd4-9dfcc88808f3%2Fd931f284-5c22-422d-9343-e509cfb44ffc.png?alt=media&token=94e52fff-4e6b-4110-94c3-90b8800f541c",
        },
        {
          id: "07f4cbbb-6a62-469e-8789-1b673a6d622f",
          name: "DragonFucker",
          index: 2,
          avatar:
            "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
        },
      ],
    },
    {
      id: "9b496931-ba27-43e0-953b-c38e01803879",
      name: "Halloween",
      realm_id: "v0",
      identities_count: "3",
      caught_identities: [
        {
          id: "47bf62fa-755f-489f-9735-27c884a0dec3",
          name: "The OG OG Komaeda",
          index: 3,
          avatar:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F1237fd9e-cd40-41b8-8ee7-11c865f27b6b?alt=media&token=4bb418a6-cb45-435c-85ed-7bdcb294f5b5",
        },
      ],
    },
    {
      id: "be93274d-cdb9-4fcc-a4f9-a9c69270ce0d",
      name: "Coders",
      realm_id: "v0",
      identities_count: "5",
      caught_identities: [],
    },
  ],
};

export const CROWN_ACCESSORY_EXTERNAL_ID =
  "9e593709-419f-4b2c-b7ee-88ed47884c3c";

export const MEMESTER_ROLE_EXTERNAL_ID = "70485a1e-4ce9-4064-bd87-440e16b2f219";

export const GOREMASTER_ROLE_EXTERNAL_ID =
  "e5f86f53-6dcd-4f15-b6ea-6ca1f088e62d";

export const OWNER_ROLE_EXTERNAL_ID = "3df1d417-c36a-43dd-aaba-9590316ffc32";
