import { UiBlockSchema } from "./UiBlockSchema";
import { RealmSettingsSchema } from "./RealmSettingsSchema";
import { RealmPermissionsSchema } from "./RealmPermissionsSchema";
import { BoardSummarySchema } from "./BoardSummarySchema";
import { z } from "zod";

export const RealmSchema = z.object({"id": z.string().uuid(),"slug": z.string(),"icon": z.string(),"homepage": z.object({"blocks": z.array(z.lazy(() => UiBlockSchema)).describe(`List of UI Blocks that appear in the Realm homepage.`)}).describe(`Settings for the Realm homepage.`),"settings": z.lazy(() => RealmSettingsSchema),"realm_permissions": z.lazy(() => RealmPermissionsSchema),"boards": z.array(z.lazy(() => BoardSummarySchema))});