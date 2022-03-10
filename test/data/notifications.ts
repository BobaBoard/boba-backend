import {
  GORE_BOARD_ID,
  MAIN_STREET_BOARD_ID,
  MODS_BOARD_ID,
  MUTED_BOARD_ID,
  RESTRICTED_BOARD_ID,
} from "./boards";

import { NotificationsResponse } from "../../types/rest/notifications";

export const BOBATAN_NOTIFICATIONS: NotificationsResponse = {
  has_notifications: true,
  is_outdated_notifications: false,
  pinned_boards: {
    ["4b30fb7c-2aca-4333-aa56-ae8623a92b65"]: {
      has_updates: true,
      id: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
      is_outdated: false,
      last_activity_at: "2020-04-24T12:44:00.000Z",
      last_activity_from_others_at: "2020-04-24T12:44:00.000Z",
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
  },
  realm_boards: {
    "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc": {
      has_updates: false,
      id: "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc",
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
    [MAIN_STREET_BOARD_ID]: {
      has_updates: false,
      id: MAIN_STREET_BOARD_ID,
      is_outdated: false,
      last_activity_at: null,
      last_activity_from_others_at: null,
      last_visited_at: null,
    },
    "4b30fb7c-2aca-4333-aa56-ae8623a92b65": {
      has_updates: true,
      id: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
      is_outdated: false,
      last_activity_at: "2020-04-24T12:44:00.000Z",
      last_activity_from_others_at: "2020-04-24T12:44:00.000Z",
      last_visited_at: null,
    },
    [RESTRICTED_BOARD_ID]: {
      has_updates: true,
      id: RESTRICTED_BOARD_ID,
      is_outdated: false,
      last_activity_at: "2020-04-24T12:44:00.000Z",
      last_activity_from_others_at: "2020-04-24T12:44:00.000Z",
      last_visited_at: null,
    },
    "bb62b150-62ae-40a8-8ce2-7e5cdeae9d0b": {
      has_updates: false,
      id: "bb62b150-62ae-40a8-8ce2-7e5cdeae9d0b",
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
    "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83": {
      has_updates: true,
      id: "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83",
      is_outdated: false,
      last_activity_at: "2020-04-25T12:42:00.000Z",
      last_activity_from_others_at: "2020-04-25T12:42:00.000Z",
      last_visited_at: null,
    },
    [MODS_BOARD_ID]: {
      has_updates: false,
      id: MODS_BOARD_ID,
      is_outdated: false,
      last_activity_at: null,
      last_activity_from_others_at: null,
      last_visited_at: null,
    },
  },
};
