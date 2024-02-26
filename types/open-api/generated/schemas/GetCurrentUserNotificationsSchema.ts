import { z } from "zod";
import { NotificationsResponseSchema } from "./NotificationsResponseSchema";

/**
 * @description User was not found in request that requires authentication.
 */
export const GetCurrentUserNotifications401Schema = z.any();

 /**
       * @description User is not authorized to perform the action.
       */
export const GetCurrentUserNotifications403Schema = z.any();
export const GetCurrentUserNotificationsPathParamsSchema = z.object({ "realm_id": z.string().uuid().describe(`The id of the realm.`) });

 /**
       * @description The notifications data.
       */
export const GetCurrentUserNotificationsQueryResponseSchema = z.lazy(() => NotificationsResponseSchema);