import { SettingSchema } from "./SettingSchema";
import { z } from "zod";

export const RealmSettingsSchema = z.object({"root": z.object({"cursor": z.object({}).optional()}),"index_page": z.array(z.lazy(() => SettingSchema)),"board_page": z.array(z.lazy(() => SettingSchema)),"thread_page": z.array(z.lazy(() => SettingSchema))}).describe(`Cosmetic settings active for the Realm, merged with users' own preferences.`);