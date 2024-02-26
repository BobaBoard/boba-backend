import { BooleanSettingSchema } from "./BooleanSettingSchema";
import { z } from "zod";

export const SettingSchema = z.lazy(() => BooleanSettingSchema);