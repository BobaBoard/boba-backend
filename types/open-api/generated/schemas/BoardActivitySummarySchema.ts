import { z } from "zod";

export const BoardActivitySummarySchema = z.object({"last_post_at": z.union([z.string(),z.null()]),"last_comment_at": z.union([z.string(),z.null()]),"last_activity_at": z.union([z.string(),z.null()]),"last_activity_from_others_at": z.union([z.string(),z.null()]),"last_visit_at": z.union([z.string(),z.null()])});