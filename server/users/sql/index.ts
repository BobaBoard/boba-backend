import pg, { QueryFile } from "pg-promise";

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

const getUserRealmRoles = `
SELECT *
FROM roles
JOIN realm_user_roles
ON roles.id = realm_user_roles.role_id
WHERE realm_user_roles.user_id = $/user_id/`;

const getUserBoardRoles = `
SELECT
  board_user_roles.board_id,
  roles.*
FROM roles
JOIN board_user_roles
ON roles.id = board_user_roles.role_id
WHERE board_user_roles.user_id = $/user_id/`;

const getUserRolesByBoard = `
SELECT
  roles.*
FROM roles
JOIN board_user_roles
ON roles.id = board_user_roles.role_id
WHERE board_user_roles.user_id = $/user_id/
AND
board_user_roles.board_id = $/board_id/`;

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
};
