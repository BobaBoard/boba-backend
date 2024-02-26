import { BaseDescriptionSchema } from "./BaseDescriptionSchema";
import { z } from "zod";

export const CategoryFilterDescriptionSchema = z.lazy(() => BaseDescriptionSchema).and(z.object({"type": z.enum([`category_filter`]),"categories": z.array(z.string())}));