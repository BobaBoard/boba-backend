const getRealmBySlug = `
    SELECT * FROM realms WHERE slug = $/realm_slug/`;

const dismissNotifications = `
    INSERT INTO dismiss_notifications_requests(user_id, realm_id, dismiss_request_time) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
        (SELECT id FROM realms WHERE realms.string_id = $/realm_id/),
         DEFAULT)
    ON CONFLICT(user_id, realm_id) DO UPDATE 
        SET dismiss_request_time = DEFAULT
        WHERE dismiss_notifications_requests.user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
          AND dismiss_notifications_requests.realm_id = (SELECT id FROM realms WHERE realms.string_id = $/realm_id/)`;

export default {
  getRealmBySlug,
  dismissNotifications,
};
