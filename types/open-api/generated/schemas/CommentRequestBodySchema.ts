import { z } from "zod";

export const CommentRequestBodySchema = z.object({"contents": z.array(z.string())});