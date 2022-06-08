import { BoardSummary } from "./boards";

interface BaseBlock {
  id: string;
  title: string;
  index: number;
  type: "rules" | "subscription";
}

export interface RulesBlock extends BaseBlock {
  type: "rules";
  rules: {
    title: string;
    description: string;
    pinned: boolean;
    index: number;
  }[];
}

export interface SubscriptionBlock extends BaseBlock {
  id: string;
  type: "subscription";
  subscription_id: string;
}

export type UiBlocks = RulesBlock | SubscriptionBlock;

export interface Realm {
  id: string;
  slug: string;
  homepage: {
    blocks: UiBlocks[];
  };
  boards: BoardSummary[];
}
