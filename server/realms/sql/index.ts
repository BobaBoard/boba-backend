const getRealmBySlug = `
    SELECT * FROM realms WHERE slug = $/realm_slug/`;

// I added this before realizing I didn't actually need it for what I was doing
// I can leave it in if it will be helpful in future, or I can delete it?
const getRealmByUuid = `
    SELECT * FROM realms WHERE id = $/realm_id/`;

const getUserPermissionsForRealm = `
    SELECT permissions 
    FROM realm_user_roles 
      JOIN roles ON role_id = id 
    WHERE user_id = $/user_id/ AND realm_id = $/realm_id/`;

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
  getRealmByUuid,
  getUserPermissionsForRealm,
  getInviteDetails,
};
