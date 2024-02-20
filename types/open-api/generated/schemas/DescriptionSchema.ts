import { TextDescriptionSchema } from "./TextDescriptionSchema";
import { CategoryFilterDescriptionSchema } from "./CategoryFilterDescriptionSchema";
import { z } from "zod";

export const DescriptionSchema = z.union([z.lazy(() => TextDescriptionSchema),z.lazy(() => CategoryFilterDescriptionSchema)]);