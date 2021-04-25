INSERT INTO setting_types(name, type) VALUES 
    ('FESTIVE_BOARD_BACKGROUND'::setting_name, 'BOOLEAN'::setting_type),
    ('FESTIVE_THREAD_BACKGROUND'::setting_name, 'BOOLEAN'::setting_type),
    ('FESTIVE_CURSOR'::setting_name, 'BOOLEAN'::setting_type),
    ('FESTIVE_CURSOR_TRAIL'::setting_name, 'BOOLEAN'::setting_type);

INSERT INTO user_settings(user_id, setting_name, setting_value) VALUES 
    (1, 'FESTIVE_BOARD_BACKGROUND'::setting_name, 'true'),
    (1, 'FESTIVE_THREAD_BACKGROUND'::setting_name, 'true'),
    (1, 'FESTIVE_CURSOR'::setting_name, 'false');