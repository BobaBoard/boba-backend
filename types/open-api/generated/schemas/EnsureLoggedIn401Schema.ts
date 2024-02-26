import { GenericResponseSchema } from "./GenericResponseSchema";
import { z } from "zod";

export const EnsureLoggedIn401Schema = z.lazy(() => GenericResponseSchema);