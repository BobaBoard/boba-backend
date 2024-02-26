import { BaseBlockSchema } from "./BaseBlockSchema";
import { z } from "zod";

export const TextBlockSchema = z.lazy(() => BaseBlockSchema).and(z.object({"type": z.enum([`text`]),"description": z.string()}));