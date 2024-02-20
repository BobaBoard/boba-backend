import { BoardActivitySummarySchema } from "./BoardActivitySummarySchema";
import { z } from "zod";

export const RealmActivitySchema = z.object({"id": z.string().uuid().describe(`The Realm id.`).optional(),"boards": z.object({}).catchall(z.object({"id": z.string().uuid().optional()}).and(z.lazy(() => BoardActivitySummarySchema))).describe(`The activity summary for each board in the realm. | Keys are the uuid of each board. `).optional()});