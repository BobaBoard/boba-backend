import { z } from "zod";

export const CursorSchema = z.object({"next": z.union([z.string(),z.null()])});