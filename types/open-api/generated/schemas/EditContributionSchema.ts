import { z } from "zod";
import { TagsSchema } from "./TagsSchema";
import { ContributionSchema } from "./ContributionSchema";

/**
 * @description User was not found in request that requires authentication.
 */
export const EditContribution401Schema = z.any();

 /**
       * @description User is not authorized to perform the action.
       */
export const EditContribution403Schema = z.any();
export const EditContributionPathParamsSchema = z.object({ "post_id": z.string().uuid().describe(`The uuid of the contribution to edit.`) });

 /**
       * @description The details of the contribution to edit.
       */
export const EditContributionMutationRequestSchema = z.lazy(() => TagsSchema);

 /**
       * @description The contribution was successfully edited.
       */
export const EditContributionMutationResponseSchema = z.object({ "contribution": z.lazy(() => ContributionSchema).optional() });