import { CursorSchema } from "./CursorSchema";
import { ThreadSummarySchema } from "./ThreadSummarySchema";
import { z } from "zod";

export const FeedActivitySchema = z.object({"cursor": z.lazy(() => CursorSchema),"activity": z.array(z.lazy(() => ThreadSummarySchema))});