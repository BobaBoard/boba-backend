import {
  ANIME_BOARD_ID,
  DELISTED_BOARD_ID,
  GORE_BOARD_ID,
  LONG_BOARD_ID,
  MAIN_STREET_BOARD_ID,
  MEMES_BOARD_ID,
  MUTED_BOARD_ID,
  RESTRICTED_BOARD_ID,
  SSSHH_BOARD_ID,
} from "./boards";

import { NotificationsResponse } from "../../types/rest/notifications";
import { TWISTED_MINDS_REALM_EXTERNAL_ID } from "./realms";

export const BOBATAN_NOTIFICATIONS: NotificationsResponse = {
  has_notifications: true,
  is_outdated_notifications: false,
  pinned_boards: {
    [ANIME_BOARD_ID]: {
      has_updates: true,
      id: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
      is_outdated: true,
      last_activity_at: "2020-04-24T12:44:00.000Z",
      last_activity_from_others_at: "2020-04-24T12:44:00.000Z",
      last_visited_at: "2022-05-10T16:42:00.000Z",
    },
    [GORE_BOARD_ID]: {
      has_updates: true,
      id: GORE_BOARD_ID,
      is_outdated: false,
      last_activity_at: "2020-10-04T12:44:00.000Z",
      last_activity_from_others_at: "2020-10-02T12:43:00.000Z",
      last_visited_at: "2020-05-25T16:42:00.000Z",
    },
  },
  realm_id: TWISTED_MINDS_REALM_EXTERNAL_ID,
  realm_boards: {
    [MEMES_BOARD_ID]: {
      has_updates: false,
      id: MEMES_BOARD_ID,
      is_outdated: false,
      last_activity_at: "2020-08-22T10:36:55.850Z",
      last_activity_from_others_at: null,
      last_visited_at: null,
    },
    [MUTED_BOARD_ID]: {
      has_updates: false,
      id: MUTED_BOARD_ID,
      is_outdated: false,
      last_activity_at: null,
      // TODO: this feels wrong, check if it's true.
      last_activity_from_others_at: null,
      last_visited_at: null,
    },
    [SSSHH_BOARD_ID]: {
      has_updates: false,
      id: SSSHH_BOARD_ID,
      is_outdated: false,
      last_activity_at: "2022-10-24T15:40:00.000Z",
      last_activity_from_others_at: null,
      last_visited_at: null,
    },
    [MAIN_STREET_BOARD_ID]: {
      has_updates: false,
      id: MAIN_STREET_BOARD_ID,
      is_outdated: false,
      last_activity_at: null,
      last_activity_from_others_at: null,
      last_visited_at: null,
    },
    [ANIME_BOARD_ID]: {
      has_updates: true,
      id: ANIME_BOARD_ID,
      is_outdated: true,
      last_activity_at: "2020-04-24T12:44:00.000Z",
      last_activity_from_others_at: "2020-04-24T12:44:00.000Z",
      last_visited_at: "2022-05-10T16:42:00.000Z",
    },
    [RESTRICTED_BOARD_ID]: {
      has_updates: true,
      id: RESTRICTED_BOARD_ID,
      is_outdated: false,
      last_activity_at: "2020-04-24T12:44:00.000Z",
      last_activity_from_others_at: "2020-04-24T12:44:00.000Z",
      last_visited_at: null,
    },
    [DELISTED_BOARD_ID]: {
      has_updates: false,
      id: DELISTED_BOARD_ID,
      is_outdated: false,
      last_activity_at: null,
      last_activity_from_others_at: null,
      last_visited_at: null,
    },
    [GORE_BOARD_ID]: {
      has_updates: true,
      id: GORE_BOARD_ID,
      is_outdated: false,
      last_activity_at: "2020-10-04T12:44:00.000Z",
      last_activity_from_others_at: "2020-10-02T12:43:00.000Z",
      last_visited_at: "2020-05-25T16:42:00.000Z",
    },
    [LONG_BOARD_ID]: {
      has_updates: true,
      id: LONG_BOARD_ID,
      is_outdated: false,
      last_activity_at: "2020-04-25T12:42:00.000Z",
      last_activity_from_others_at: "2020-04-25T12:42:00.000Z",
      last_visited_at: null,
    },
  },
};
