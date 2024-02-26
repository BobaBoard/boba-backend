import { LoggedInBoardSummarySchema } from "./LoggedInBoardSummarySchema";
import { BoardMetadataSchema } from "./BoardMetadataSchema";
import { AccessorySchema } from "./AccessorySchema";
import { PermissionsSchema } from "./PermissionsSchema";
import { PostingIdentitySchema } from "./PostingIdentitySchema";
import { z } from "zod";

export const LoggedInBoardMetadataSchema = z.lazy(() => LoggedInBoardSummarySchema).and(z.lazy(() => BoardMetadataSchema)).and(z.object({"accessories": z.array(z.lazy(() => AccessorySchema)),"permissions": z.lazy(() => PermissionsSchema),"posting_identities": z.array(z.lazy(() => PostingIdentitySchema))}));