INSERT INTO accessories(id, string_id, image_reference_id, name) OVERRIDING SYSTEM VALUE VALUES 
    (1, '81b7f5ca-8396-4f60-9b4b-15f400104d59', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485', 'Reindeer'),
    (2, 'f6cd41aa-063e-466c-a4a3-f20982b8ac4c', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F989f4b40-c1b8-4793-93dd-57e93df3e7ec.png?alt=media&token=cabdd8d5-b6a9-4914-bb59-eda4629f151b', NULL),
    (3, '9e593709-419f-4b2c-b7ee-88ed47884c3c', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F7c6c9459-7fa1-4d06-8dc0-ebb5b1bd76a8.png?alt=media&token=78d812a5-b217-4afb-99f3-41b9ed7b7ed5', NULL);
INSERT INTO identity_thread_accessories(thread_id,identity_id, accessory_id) VALUES 
    ((SELECT id FROM threads WHERE string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'),
     (SELECT id FROM secret_identities WHERE display_name = 'Old Time-y Anon'),
     1),
     ((SELECT id FROM threads WHERE string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'),
     (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'),
     2);

INSERT INTO role_accessories(role_id, accessory_id) VALUES (
    (SELECT id FROM roles WHERE name = 'The Owner'),
    3
);

INSERT INTO accessories(id, string_id, image_reference_id, name) OVERRIDING SYSTEM VALUE VALUES  
    (4, 'c82b99b4-9aa7-4792-8e6b-211edba5981e', '/420accessories/weed_hands.png', 'Rolling'),
    (5, 'fc75cd7c-e6fa-4e82-af82-dc2d2e32ecae', '/420accessories/joint.png', 'Joint');

INSERT INTO realm_accessories(accessory_id) VALUES 
    (4), 
    (5);