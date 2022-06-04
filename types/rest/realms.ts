import { BoardSummary } from "./boards";

export interface RulesBlock {
  id: string;
  title: string;
  index: number;
  type: "rules";
  rules: {
    title: string;
    description: string;
    pinned: boolean;
    index: number;
  }[];
}

export interface Realm {
  id: string;
  slug: string;
  homepage: {
    blocks: RulesBlock[];
  };
  boards: BoardSummary[];
}
