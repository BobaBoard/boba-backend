import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";

export const DismissUserNotifications500Schema = z.any();
export const DismissUserNotificationsMutationResponseSchema = z.any();
export const DismissUserNotificationsPathParamsSchema = z.object({ "realm_id": z.string().uuid().describe(`The id of the realm.`) });
export const DismissUserNotifications401Schema = z.lazy(() => GenericResponseSchema);
export const DismissUserNotifications403Schema = z.lazy(() => GenericResponseSchema);