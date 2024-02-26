import { z } from "zod";

export const SubscriptionSchema = z.object({"id": z.string().uuid(),"name": z.string(),"last_activity_at": z.union([z.string(),z.null()])});