const getRealmBySlug = `
    SELECT * FROM realms WHERE slug = $/realm_slug/`;

const getRealmIdsByUuid = `
    SELECT * FROM realms WHERE string_id = $/realm_id/`;

const getUserPermissionsForRealm = `
    SELECT to_json(permissions) AS permissions 
    FROM users
      JOIN realm_user_roles ON users.id = realm_user_roles.user_id
      JOIN roles ON realm_user_roles.role_id = roles.id
      JOIN realms ON realm_user_roles.realm_id = realms.id 
    WHERE users.firebase_id = $/user_id/ AND realms.string_id = $/realm_id/`;

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
      realm.string_id,
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
users.string_id AS inviter_id,
invitee_email,
created + duration AS expires_at,
created,
label 
FROM account_invites
JOIN realms ON account_invites.realm_id = realms.id 
JOIN users ON account_invites.inviter = users.id
WHERE realms.string_id = ${realmStringId} AND used = false AND created + duration > NOW()`;

export default {
  getRealmBySlug,
  getRealmIdsByUuid,
  getUserPermissionsForRealm,
  getInviteDetails,
  createRealmInvite,
  getInvites,
};
