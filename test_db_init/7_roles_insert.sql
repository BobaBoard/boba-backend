INSERT INTO roles(string_id, name, avatar_reference_id, color, description, permissions)
VALUES
    ('e5f86f53-6dcd-4f15-b6ea-6ca1f088e62d', 'GoreMaster5000', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8', 
    'red', 'A role for people who can edit the gore board.', 
    ARRAY['edit_board_details'::role_permissions,
          'post_as_role'::role_permissions]);

INSERT INTO board_user_roles(user_id, board_id, role_id)
VALUES
    ((SELECT id FROM users WHERE username = 'bobatan'),
    (SELECT id FROM boards WHERE slug = 'gore'),
    (SELECT id FROM roles WHERE name = 'GoreMaster5000'));