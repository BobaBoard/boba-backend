import { Accessory, Role } from "./identity";

import { UserBoardPermissions } from "Types";

export interface BoardDescription {
  id?: string;
  index: number;
  title: string;
  type: "text" | "category_filter";
  description?: string;
  categories?: string[];
}

export interface BoardSummary {
  id: string;
  realm_id: string;
  slug: string;
  avatar_url: string;
  tagline: string;
  accent_color: string;
  logged_in_only: boolean;
  delisted: boolean;
}

export interface LoggedInBoardSummary {
  id: string;
  realm_id: string;
  slug: string;
  avatar_url: string;
  tagline: string;
  accent_color: string;
  logged_in_only: boolean;
  delisted: boolean;
  muted: boolean;
  pinned: boolean;
}

export interface BoardMetadata extends BoardSummary {
  descriptions: BoardDescription[];
}

export interface LoggedInBoardMetadata
  extends BoardMetadata,
    LoggedInBoardSummary {
  permissions: UserBoardPermissions;
  posting_identities: Role[];
  accessories: Accessory[];
}
