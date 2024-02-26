import { SettingSchema } from "./SettingSchema";
import { z } from "zod";

export const UserSettingsSchema = z.object({"decorations": z.array(z.lazy(() => SettingSchema)).optional()});