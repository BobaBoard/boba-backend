import type { TextBlock } from "./TextBlock";
import type { RulesBlock } from "./RulesBlock";
import type { SubscriptionBlock } from "./SubscriptionBlock";

export type UiBlock = (TextBlock | RulesBlock | SubscriptionBlock);