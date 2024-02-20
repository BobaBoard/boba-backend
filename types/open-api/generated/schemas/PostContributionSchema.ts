import { z } from "zod";
import { TagsSchema } from "./TagsSchema";
import { IdentityParamsSchema } from "./IdentityParamsSchema";
import { ContributionSchema } from "./ContributionSchema";

/**
 * @description User was not found in request that requires authentication.
 */
export const PostContribution401Schema = z.any();

 /**
       * @description User is not authorized to perform the action.
       */
export const PostContribution403Schema = z.any();
export const PostContributionPathParamsSchema = z.object({ "post_id": z.string().uuid().describe(`The uuid of the contribution to reply to.`) });

 /**
       * @description The contribution was successfully created.
       */
export const PostContributionMutationResponseSchema = z.object({ "contribution": z.lazy(() => ContributionSchema).optional() });

 /**
       * @description The details of the contribution to post.
       */
export const PostContributionMutationRequestSchema = z.object({ "content": z.string().optional() }).and(z.lazy(() => TagsSchema)).and(z.lazy(() => IdentityParamsSchema));