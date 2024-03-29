export interface BoardTextDescription {
  id: string;
  index: number;
  title: string;
  type: "text";
  description: string;
}

export interface BoardCategoryDescription {
  id: string;
  index: number;
  title: string;
  type: "category_filter";
  categories: string[];
}

export type BoardDescription = BoardCategoryDescription | BoardTextDescription;

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
