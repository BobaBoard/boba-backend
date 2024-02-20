import { z } from "zod";

export const AccessorySchema = z.object({"id": z.string().uuid(),"name": z.string(),"accessory": z.string()});