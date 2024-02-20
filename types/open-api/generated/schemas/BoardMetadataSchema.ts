import { BoardSummarySchema } from "./BoardSummarySchema";
import { DescriptionSchema } from "./DescriptionSchema";
import { z } from "zod";

export const BoardMetadataSchema = z.lazy(() => BoardSummarySchema).and(z.object({"descriptions": z.array(z.lazy(() => DescriptionSchema))}));