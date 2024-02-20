import { CursorSchema } from "./CursorSchema";
import { SubscriptionSchema } from "./SubscriptionSchema";
import { ContributionSchema } from "./ContributionSchema";
import { z } from "zod";

export const SubscriptionActivitySchema = z.object({"cursor": z.lazy(() => CursorSchema).optional(),"subscription": z.lazy(() => SubscriptionSchema),"activity": z.array(z.lazy(() => ContributionSchema))});