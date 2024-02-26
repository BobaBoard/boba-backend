import type { Tags } from "./Tags";
import type { Contribution } from "./Contribution";

/**
 * @description User was not found in request that requires authentication.
*/
export type EditContribution401 = any | null;

 /**
 * @description User is not authorized to perform the action.
*/
export type EditContribution403 = any | null;

 export type EditContributionPathParams = {
    /**
     * @description The uuid of the contribution to edit.
     * @type string uuid
    */
    post_id: string;
};

 /**
 * @description The details of the contribution to edit.
*/
export type EditContributionMutationRequest = Tags;

 /**
 * @description The contribution was successfully edited.
*/
export type EditContributionMutationResponse = {
    /**
     * @description Finalized details of the contributions just edited.
    */
    contribution?: Contribution;
};
export type EditContributionMutation = {
    Response: EditContributionMutationResponse;
    Request: EditContributionMutationRequest;
    PathParams: EditContributionPathParams;
    Errors: EditContribution401 | EditContribution403;
};