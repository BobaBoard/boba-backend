import { BaseDescriptionSchema } from "./BaseDescriptionSchema";
import { z } from "zod";

export const TextDescriptionSchema = z.lazy(() => BaseDescriptionSchema).and(z.object({"type": z.enum([`text`]),"description": z.string()}));