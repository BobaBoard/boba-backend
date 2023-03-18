import { QueryFile } from "pg-promise";
import path from "path";

const updateUserSettings = `
  INSERT INTO user_settings(user_id, setting_name, setting_value) VALUES 
    ((SELECT id FROM users WHERE users.firebase_id = $/firebase_id/), $/setting_name/, $/setting_value/)
  ON CONFLICT(user_id, setting_name) DO UPDATE 
    SET setting_value = $/setting_value/
    WHERE user_settings.user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
        AND user_settings.setting_name = $/setting_name/`;

const getUserSettings = `
  SELECT
    setting_name as name,
    setting_value as value,
    type
  FROM user_settings
  LEFT JOIN setting_types ON
    user_settings.setting_name = setting_types.name
  WHERE user_settings.user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/);
`;

const getSettingType = `
  SELECT type
  FROM setting_types
  WHERE setting_types.name = $/setting_name/
`;

const getUserDetails =
  "SELECT * FROM users WHERE firebase_id = $/firebase_id/ LIMIT 1";

const updateUserData = `
    UPDATE users
    SET username = $/username/,
        avatar_reference_id = $/avatar_url/
    WHERE firebase_id = $/firebase_id/`;

const createNewUser = `
INSERT INTO users(firebase_id, invited_by, created_on)
VALUES ($/firebase_id/, $/invited_by/, $/created_on/)`;

const getAllUserRoles = `
  SELECT
    roles.*,
    realms.string_id AS realm_external_id,
    boards.string_id AS board_external_id
  FROM roles
  JOIN realm_user_roles ON
    roles.id = realm_user_roles.role_id
  JOIN board_user_roles ON
    roles.id = board_user_roles.role_id
  JOIN users ON
    users.id = realm_user_roles.user_id
  JOIN realms ON
    realms.id = realm_user_roles.realm_id
  JOIN boards ON
    boards.id = board_user_roles.board_id
  WHERE users.firebase_id = $/firebase_id/`;
// also this does not work yet! it doesn't grab realm roles that aren't also board roles, which I think is where some fancy joins come in to allow stuff to be null
// what I'll want to do here is aggregate down duplicates - the same role on multiple boards should only appear once but the boards field should be an array with the list of boards where it appears; same for realms; there's probably also some left/right/idk join optimization I could do but I do not remember the point of any of it

const getUserRolesByRealm = `
  SELECT
    roles.*
  FROM roles
  JOIN realm_user_roles ON
    roles.id = realm_user_roles.role_id
  JOIN users ON
    users.id = realm_user_roles.user_id
  JOIN realms ON
    realms.id = realm_user_roles.realm_id
  WHERE users.firebase_id = $/firebase_id/
    AND realms.string_id = $/realm_id/`;

const getUserRolesByBoard = `
  SELECT
    roles.*
  FROM roles
  JOIN board_user_roles ON
    roles.id = board_user_roles.role_id
  JOIN users ON
    users.id = board_user_roles.user_id
  JOIN boards ON
    boards.id = board_user_roles.board_id
  WHERE users.firebase_id = $/firebase_id/
    AND boards.string_id = $/board_id/`;

export default {
  getUserDetails,
  createNewUser,
  getSettingType,
  updateUserData,
  getUserSettings,
  updateUserSettings,
  getBobadexIdentities: new QueryFile(
    path.join(__dirname, "fetch-bobadex.sql")
  ),
  getUserRolesByRealm,
  getUserRolesByBoard,
};
