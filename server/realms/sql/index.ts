const getRealmBySlug = `
    SELECT * FROM realms WHERE slug = $/realm_slug/`;

const getRealmIdsByUuid = `
    SELECT * FROM realms WHERE string_id = $/realm_id/`;

const getUserPermissionsForRealm = `
    SELECT to_json(permissions) AS permissions 
    FROM users
      JOIN realm_user_roles ON users.id = realm_user_roles.user_id
      JOIN roles ON realm_user_roles.role_id = roles.id 
    WHERE firebase_id = $/user_id/ AND realm_user_roles.realm_id = $/realm_id/`;

const getInviteDetails = `
    SELECT 
      inviter,
      invitee_email,
      created + duration < NOW() as expired,
      used 
    FROM account_invites WHERE nonce = $/nonce/ 
    ORDER BY created LIMIT 1`;

export default {
  getRealmBySlug,
  getRealmIdsByUuid,
  getUserPermissionsForRealm,
  getInviteDetails,
};
