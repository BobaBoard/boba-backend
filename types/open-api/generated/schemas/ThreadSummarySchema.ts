import { ContributionSchema } from "./ContributionSchema";
import { ThreadActivitySummarySchema } from "./ThreadActivitySummarySchema";
import { z } from "zod";

export const ThreadSummarySchema = z.object({"id": z.string().uuid(),"parent_board_slug": z.string(),"parent_board_id": z.string(),"parent_realm_slug": z.string(),"parent_realm_id": z.string(),"starter": z.lazy(() => ContributionSchema),"default_view": z.enum([`thread`,`gallery`,`timeline`]),"new": z.boolean().describe(`Whether the thread is new. False when the user is logged out.`),"muted": z.boolean().describe(`Whether the thread is muted. False when the user is logged out.`),"hidden": z.boolean().describe(`Whether the thread is hidden. False when the user is logged out.`),"starred": z.boolean().describe(`Whether the thread is starred.`)}).and(z.lazy(() => ThreadActivitySummarySchema));