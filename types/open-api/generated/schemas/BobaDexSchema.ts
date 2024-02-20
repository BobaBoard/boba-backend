import { BobaDexSeasonSchema } from "./BobaDexSeasonSchema";
import { z } from "zod";

export const BobaDexSchema = z.object({"seasons": z.array(z.lazy(() => BobaDexSeasonSchema))});