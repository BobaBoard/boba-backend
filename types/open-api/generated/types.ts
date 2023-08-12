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
