INSERT INTO accessories(image_reference_id) VALUES 
    ('https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485'),
    ('https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F989f4b40-c1b8-4793-93dd-57e93df3e7ec.png?alt=media&token=cabdd8d5-b6a9-4914-bb59-eda4629f151b');
INSERT INTO identity_thread_accessories(thread_id,identity_id, accessory_id) VALUES 
    ((SELECT id FROM threads WHERE string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'),
     (SELECT id FROM secret_identities WHERE display_name = 'Old Time-y Anon'),
     1),
     ((SELECT id FROM threads WHERE string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'),
     (SELECT id FROM secret_identities WHERE display_name = 'DragonFucker'),
     2);
