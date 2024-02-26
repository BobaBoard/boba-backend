import { BaseBlockSchema } from "./BaseBlockSchema";
import { z } from "zod";

export const SubscriptionBlockSchema = z.lazy(() => BaseBlockSchema).and(z.object({"type": z.enum([`subscription`]),"subscription_id": z.string().uuid()}));