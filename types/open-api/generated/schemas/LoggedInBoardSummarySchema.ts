import { BoardSummarySchema } from "./BoardSummarySchema";
import { z } from "zod";

export const LoggedInBoardSummarySchema = z.lazy(() => BoardSummarySchema).and(z.object({"muted": z.boolean(),"pinned": z.boolean()}));