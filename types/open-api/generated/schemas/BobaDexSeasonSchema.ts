import { PostingIdentitySchema } from "./PostingIdentitySchema";
import { z } from "zod";

export const BobaDexSeasonSchema = z.object({"id": z.string().uuid(),"realm_id": z.string(),"name": z.string(),"identities_count": z.number().describe(`How many identities are in this season. Note that just the array of identities isn't enough, cause it doesn't tell us how many identities are in total in the BobaDex season. `),"caught_identities": z.array(z.object({"index": z.number(),"identity": z.lazy(() => PostingIdentitySchema)}))});