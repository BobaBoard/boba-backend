import { z } from "zod";

export const ThreadPermissionSchema = z.enum([`move_thread`]);