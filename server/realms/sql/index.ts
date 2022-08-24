import { QueryFile } from "pg-promise";
import path from "path";

const dismissNotifications = `
    INSERT INTO dismiss_notifications_requests(user_id, realm_id, dismiss_request_time) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
        (SELECT id FROM realms WHERE realms.string_id = $/realm_id/),
         DEFAULT)
    ON CONFLICT(user_id, realm_id) DO UPDATE 
        SET dismiss_request_time = DEFAULT
        WHERE dismiss_notifications_requests.user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
          AND dismiss_notifications_requests.realm_id = (SELECT id FROM realms WHERE realms.string_id = $/realm_id/)`;

const getRealmIdsByUuid = `
    SELECT * FROM realms WHERE string_id = $/realm_id/`;

const getUserPermissionsForRealm = `
    SELECT to_json(permissions) AS permissions 
    FROM users
      JOIN realm_user_roles ON users.id = realm_user_roles.user_id
      JOIN roles ON realm_user_roles.role_id = roles.id
      JOIN realms ON realm_user_roles.realm_id = realms.id 
    WHERE users.firebase_id = $/user_id/ AND realms.string_id = $/realm_string_id/`;

const createRealmInvite = `
    INSERT INTO account_invites(nonce, realm_id, inviter, invitee_email, label, duration)
    VALUES (
      $/invite_code/,
      (SELECT id FROM realms WHERE string_id = $/realm_id/),
      $/inviter_id/,
      $/email/,
      $/label/,
      INTERVAL '1 WEEK')`;

const getInviteDetails = `
    SELECT 
      realms.string_id AS realm_id,
      inviter,
      invitee_email,
      created + duration < NOW() as expired,
      used 
    FROM account_invites
    JOIN realms ON account_invites.realm_id = realms.id 
    WHERE nonce = $/nonce/ 
    ORDER BY created LIMIT 1`;

const getInvites = `
    SELECT 
      nonce,
      users.firebase_id AS inviter_id,
      invitee_email,
      created + duration AS expires_at,
      created,
      label 
    FROM account_invites
    JOIN realms ON account_invites.realm_id = realms.id 
    JOIN users ON account_invites.inviter = users.id
    WHERE realms.string_id = $/realmStringId/ AND used = false AND created + duration > NOW()`;

const addUserToRealm = `
INSERT INTO realm_users(realm_id, user_id)
VALUES (
(SELECT id FROM realms WHERE string_id = $/realm_string_id/),
(SELECT id FROM users WHERE firebase_id = $/firebase_id/)
)`;

const findUserOnRealm = `
SELECT * FROM realm_users
JOIN realms ON realm_users.realm_id = realms.id
JOIN users ON realm_users.user_id = users.id
WHERE users.firebase_id = $/firebase_id/ AND realms.string_id = $/realm_string_id/
`;

export default {
  getRealmBySlug: new QueryFile(path.join(__dirname, "realm-by-slug.sql")),
  dismissNotifications,
  getRealmIdsByUuid,
  getUserPermissionsForRealm,
  getInviteDetails,
  createRealmInvite,
  getInvites,
  addUserToRealm,
  findUserOnRealm,
};
