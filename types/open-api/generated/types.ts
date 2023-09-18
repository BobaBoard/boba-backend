import * as schemas from "./schemas";

import { z } from "zod";

export type BoardSummary = z.infer<typeof schemas.BoardSummarySchema>;
export type BaseDescription = z.infer<typeof schemas.BaseDescriptionSchema>;
export type TextDescription = z.infer<typeof schemas.TextDescriptionSchema>;
export type CategoryFilterDescription = z.infer<
  typeof schemas.CategoryFilterDescriptionSchema
>;
export type Description = z.infer<typeof schemas.DescriptionSchema>;
export type BoardMetadata = z.infer<typeof schemas.BoardMetadataSchema>;
export type LoggedInBoardSummary = z.infer<
  typeof schemas.LoggedInBoardSummarySchema
>;
export type Accessory = z.infer<typeof schemas.AccessorySchema>;
export type BoardPermissions = z.infer<typeof schemas.BoardPermissionsSchema>;
export type PostPermissions = z.infer<typeof schemas.PostPermissionsSchema>;
export type ThreadPermission = z.infer<typeof schemas.ThreadPermissionSchema>;
export type Permissions = z.infer<typeof schemas.PermissionsSchema>;
export type PostingIdentity = z.infer<typeof schemas.PostingIdentitySchema>;
export type LoggedInBoardMetadata = z.infer<
  typeof schemas.LoggedInBoardMetadataSchema
>;
export type CreateThread = z.infer<typeof schemas.CreateThreadSchema>;
export type SecretIdentity = z.infer<typeof schemas.SecretIdentitySchema>;
export type Identity = z.infer<typeof schemas.IdentitySchema>;
export type Tags = z.infer<typeof schemas.TagsSchema>;
export type Contribution = z.infer<typeof schemas.ContributionSchema>;
export type Comment = z.infer<typeof schemas.CommentSchema>;
export type ThreadActivitySummary = z.infer<
  typeof schemas.ThreadActivitySummarySchema
>;
export type ThreadSummary = z.infer<typeof schemas.ThreadSummarySchema>;
export type Thread = z.infer<typeof schemas.ThreadSchema>;
export type BoardDescription = z.infer<typeof schemas.BoardDescriptionSchema>;
export type Cursor = z.infer<typeof schemas.CursorSchema>;
export type FeedActivity = z.infer<typeof schemas.FeedActivitySchema>;
export type IdentityParams = z.infer<typeof schemas.IdentityParamsSchema>;
export type postContribution_Body = z.infer<
  typeof schemas.postContribution_BodySchema
>;
export type CommentRequestBody = z.infer<
  typeof schemas.CommentRequestBodySchema
>;
export type postComment_Body = z.infer<typeof schemas.postComment_BodySchema>;
export type BaseBlock = z.infer<typeof schemas.BaseBlockSchema>;
export type TextBlock = z.infer<typeof schemas.TextBlockSchema>;
export type RulesBlock = z.infer<typeof schemas.RulesBlockSchema>;
export type SubscriptionBlock = z.infer<typeof schemas.SubscriptionBlockSchema>;
export type UiBlock = z.infer<typeof schemas.UiBlockSchema>;
export type BooleanSetting = z.infer<typeof schemas.BooleanSettingSchema>;
export type Setting = z.infer<typeof schemas.SettingSchema>;
export type RealmSettings = z.infer<typeof schemas.RealmSettingsSchema>;
export type RealmPermissions = z.infer<typeof schemas.RealmPermissionsSchema>;
export type Realm = z.infer<typeof schemas.RealmSchema>;
export type BoardActivitySummary = z.infer<
  typeof schemas.BoardActivitySummarySchema
>;
export type RealmActivity = z.infer<typeof schemas.RealmActivitySchema>;
export type ActivityNotifications = z.infer<
  typeof schemas.ActivityNotificationsSchema
>;
export type NotificationsResponse = z.infer<
  typeof schemas.NotificationsResponseSchema
>;
export type InviteWithDetails = z.infer<typeof schemas.InviteWithDetailsSchema>;
export type genericResponse = z.infer<typeof schemas.genericResponseSchema>;
export type createInviteByRealmId_Body = z.infer<
  typeof schemas.createInviteByRealmId_BodySchema
>;
export type Invite = z.infer<typeof schemas.InviteSchema>;
export type InviteStatus = z.infer<typeof schemas.InviteStatusSchema>;
export type acceptInviteByNonce_Body = z.infer<
  typeof schemas.acceptInviteByNonce_BodySchema
>;
export type AcceptedInviteResponse = z.infer<
  typeof schemas.AcceptedInviteResponseSchema
>;
export type Subscription = z.infer<typeof schemas.SubscriptionSchema>;
export type SubscriptionActivity = z.infer<
  typeof schemas.SubscriptionActivitySchema
>;
export type updateThreadExternalId_Body = z.infer<
  typeof schemas.updateThreadExternalId_BodySchema
>;
export type updateCurrentUser_Body = z.infer<
  typeof schemas.updateCurrentUser_BodySchema
>;
export type BobaDexSeason = z.infer<typeof schemas.BobaDexSeasonSchema>;
export type BobaDex = z.infer<typeof schemas.BobaDexSchema>;
export type UserSettings = z.infer<typeof schemas.UserSettingsSchema>;
export type updateUserSettings_Body = z.infer<
  typeof schemas.updateUserSettings_BodySchema
>;

// TODO: figure out how to make these endpoints camel case
export type getBoardsByExternalIdResponse = z.infer<
  typeof schemas.endpoints.getBoardsByExternalId.response
>;
export type createThreadResponse = z.infer<
  typeof schemas.endpoints.createThread.response
>;
export type patchBoardsByExternalIdResponse = z.infer<
  typeof schemas.endpoints.patchBoardsByExternalId.response
>;
export type muteBoardsByExternalIdResponse = z.infer<
  typeof schemas.endpoints.muteBoardsByExternalId.response
>;
export type unmuteBoardsByExternalIdResponse = z.infer<
  typeof schemas.endpoints.unmuteBoardsByExternalId.response
>;
export type dismissBoardsByExternalIdResponse = z.infer<
  typeof schemas.endpoints.dismissBoardsByExternalId.response
>;
export type pinBoardsByExternalIdResponse = z.infer<
  typeof schemas.endpoints.pinBoardsByExternalId.response
>;
export type unpinBoardsByExternalIdResponse = z.infer<
  typeof schemas.endpoints.unpinBoardsByExternalId.response
>;
export type visitBoardsByExternalIdResponse = z.infer<
  typeof schemas.endpoints.visitBoardsByExternalId.response
>;
export type getBoardsFeedByExternalIdResponse = z.infer<
  typeof schemas.endpoints.getBoardsFeedByExternalId.response
>;
export type getPersonalFeedResponse = z.infer<
  typeof schemas.endpoints.getPersonalFeed.response
>;
export type getUserStarFeedResponse = z.infer<
  typeof schemas.endpoints.getUserStarFeed.response
>;
export type postCommentResponse = z.infer<
  typeof schemas.endpoints.postComment.response
>;
export type postContributionResponse = z.infer<
  typeof schemas.endpoints.postContribution.response
>;
export type editContributionResponse = z.infer<
  typeof schemas.endpoints.editContribution.response
>;
export type getRealmsActivityByExternalIdResponse = z.infer<
  typeof schemas.endpoints.getRealmsActivityByExternalId.response
>;
export type getInvitesByRealmIdResponse = z.infer<
  typeof schemas.endpoints.getInvitesByRealmId.response
>;
export type createInviteByRealmIdResponse = z.infer<
  typeof schemas.endpoints.createInviteByRealmId.response
>;
export type getInviteByNonceResponse = z.infer<
  typeof schemas.endpoints.getInviteByNonce.response
>;
export type acceptInviteByNonceResponse = z.infer<
  typeof schemas.endpoints.acceptInviteByNonce.response
>;
export type getCurrentUserNotificationsResponse = z.infer<
  typeof schemas.endpoints.getCurrentUserNotifications.response
>;
export type dismissUserNotificationsResponse = z.infer<
  typeof schemas.endpoints.dismissUserNotifications.response
>;
export type getRealmsBySlugResponse = z.infer<
  typeof schemas.endpoints.getRealmsBySlug.response
>;
export type getSubscriptionResponse = z.infer<
  typeof schemas.endpoints.getSubscription.response
>;
export type getThreadByExternalIdResponse = z.infer<
  typeof schemas.endpoints.getThreadByExternalId.response
>;
export type updateThreadExternalIdResponse = z.infer<
  typeof schemas.endpoints.updateThreadExternalId.response
>;
export type hideThreadByExternalIdResponse = z.infer<
  typeof schemas.endpoints.hideThreadByExternalId.response
>;
export type unhideThreadByExternalIdResponse = z.infer<
  typeof schemas.endpoints.unhideThreadByExternalId.response
>;
export type muteThreadByExternalIdResponse = z.infer<
  typeof schemas.endpoints.muteThreadByExternalId.response
>;
export type unmuteThreadByExternalIdResponse = z.infer<
  typeof schemas.endpoints.unmuteThreadByExternalId.response
>;
export type starThreadByExternalIdResponse = z.infer<
  typeof schemas.endpoints.starThreadByExternalId.response
>;
export type unstarThreadByExternalIdResponse = z.infer<
  typeof schemas.endpoints.unstarThreadByExternalId.response
>;
export type visitThreadByExternalIdResponse = z.infer<
  typeof schemas.endpoints.visitThreadByExternalId.response
>;
export type getCurrentUserResponse = z.infer<
  typeof schemas.endpoints.getCurrentUser.response
>;
export type updateCurrentUserResponse = z.infer<
  typeof schemas.endpoints.updateCurrentUser.response
>;
export type getCurrentUserBobadexResponse = z.infer<
  typeof schemas.endpoints.getCurrentUserBobadex.response
>;
export type getCurrentUserPinnedBoardsForRealmResponse = z.infer<
  typeof schemas.endpoints.getCurrentUserPinnedBoardsForRealm.response
>;
export type getUserSettingsResponse = z.infer<
  typeof schemas.endpoints.getUserSettings.response
>;
export type updateUserSettingsResponse = z.infer<
  typeof schemas.endpoints.updateUserSettings.response
>;
