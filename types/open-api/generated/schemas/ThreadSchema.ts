import { ContributionSchema } from "./ContributionSchema";
import { CommentSchema } from "./CommentSchema";
import { ThreadSummarySchema } from "./ThreadSummarySchema";
import { z } from "zod";

export const ThreadSchema = z.object({"posts": z.array(z.lazy(() => ContributionSchema)),"comments": z.object({}).catchall(z.array(z.lazy(() => CommentSchema))).describe(`A map from post_id to its comments.`)}).and(z.lazy(() => ThreadSummarySchema));