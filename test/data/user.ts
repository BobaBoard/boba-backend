import { REALM_MEMBER_PERMISSIONS, RealmPermissions } from "types/permissions";

import { UserData } from "../../types/rest/user";

export const BOBATAN_USER_DATA: UserData = {
  avatar_url: "/bobatan.png",
  pinned_boards: {
    anime: {
      accent_color: "#24d282",
      avatar_url: "/anime.png",
      delisted: false,
      id: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
      index: "2",
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
      index: "1",
      logged_in_only: false,
      muted: false,
      pinned: true,
      realm_id: "76ef4cc3-1603-4278-95d7-99c59f481d2e",
      slug: "gore",
      tagline: "Blood! Blood! Blood!",
    },
  },
  username: "bobatan",
};

export const ONCEST_USER_IDENTITY = {
  avatar: "/greedler.jpg",
  name: "oncest5evah",
};

export const BOBATAN_TWISTED_MINDS_REALM_PERMISSIONS = [
  RealmPermissions.createRealmInvite,
  ...REALM_MEMBER_PERMISSIONS,
];
