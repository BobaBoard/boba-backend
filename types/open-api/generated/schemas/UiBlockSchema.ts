import { TextBlockSchema } from "./TextBlockSchema";
import { RulesBlockSchema } from "./RulesBlockSchema";
import { SubscriptionBlockSchema } from "./SubscriptionBlockSchema";
import { z } from "zod";

export const UiBlockSchema = z.union([z.lazy(() => TextBlockSchema),z.lazy(() => RulesBlockSchema),z.lazy(() => SubscriptionBlockSchema)]);