INSERT INTO secret_identities(id, external_id, display_name, avatar_reference_id) OVERRIDING SYSTEM VALUE 
VALUES
    ( 1, '85e33a3c-f987-41fd-a555-4c0cfdedf737', 'Old Time-y Anon', 'https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png'), 
    ( 2, '07f4cbbb-6a62-469e-8789-1b673a6d622f', 'DragonFucker', 'https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg'), 
    ( 3, '31eeb959-9a23-454a-b726-9c203a512520', 'Outdated Meme', 'outdated-meme.png'),
    ( 4, 'ed8a6fcb-9b94-4f98-94ff-d9c0b9f0e5c9', 'The Prophet', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2Fbe6d2b51-8192-4b78-a140-fecd1ec54f71?alt=media&token=4a13133b-f8fb-478b-9be4-22fa0f4a97c8'),
    ( 5, '88c258eb-c93f-4ac9-8271-1ac227c453ac', 'Him Free', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F4e72a52a-9fdd-4a49-a7f0-ffa56a46836d?alt=media&token=153015fa-c46b-4184-a17f-10c3e609bf70'),
    ( 6, '47bf62fa-755f-489f-9735-27c884a0dec3', 'The OG OG Komaeda', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F1237fd9e-cd40-41b8-8ee7-11c865f27b6b?alt=media&token=4bb418a6-cb45-435c-85ed-7bdcb294f5b5'),
    ( 7, '3510120b-3c20-4ee2-96fc-91ec0d48fc2a', 'Little Bobby''s Mom', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Ffancoders%2F290eafc5-123d-42d6-925b-2eedaf4f92dc%2Faa1b56ba-6c1d-4306-acf7-31eb6445149d.png?alt=media&token=9a9f860b-2630-420b-bdfe-e83130cd29ce'),
    ( 8, 'a5ca26c0-0079-495f-bb94-f37a31696b15', '"I''m in"', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Ffancoders%2F290eafc5-123d-42d6-925b-2eedaf4f92dc%2Fd5584290-1c7b-47de-9f02-58994f381dba.png?alt=media&token=1ef20795-35c8-4f3f-96e6-67838379f27c'),
    ( 9, 'e825cc3b-5a0b-4cad-848c-46ccef220de3', '(((()()(()()()))))', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Ffancoders%2F290eafc5-123d-42d6-925b-2eedaf4f92dc%2F43b675d4-cbff-4751-adf1-72d8efc2b487.png?alt=media&token=e7faa860-e971-451d-8043-cc42e58a40f2'),
    (10, '6aa5ed0d-82fe-4a1d-bc6a-6f00dd6ac5ce', 'Professional Debugging Tool', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Ffancoders%2F290eafc5-123d-42d6-925b-2eedaf4f92dc%2F0f40e3e0-aa43-4418-aed4-4859131418b7.png?alt=media&token=3abd262f-36cb-4c49-9e09-c9c42511a421'),
    (11, '7147772f-68c7-456c-b16c-50066c31655f', 'Blue Screen of Desu', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Ffancoders%2F290eafc5-123d-42d6-925b-2eedaf4f92dc%2Fd06ce903-f7a6-4475-92b5-d141cd4d9335.png?alt=media&token=baffac94-d95f-4803-a63c-410c01c35b11');

INSERT INTO bobadex_seasons(id, external_id, name) OVERRIDING SYSTEM VALUE 
VALUES
    (1, '9f6d41a5-1e00-4071-9f50-555f1686f87f', 'Default'), 
    (2, '9b496931-ba27-43e0-953b-c38e01803879', 'Halloween'),
    (3, 'be93274d-cdb9-4fcc-a4f9-a9c69270ce0d', 'Coders');

INSERT INTO bobadex_season_secret_identities(bobadex_season_id, secret_identity_id)
VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (2, 4),
    (2, 5),
    (2, 6),
    (3, 7),
    (3, 8),
    (3, 9),
    (3, 10),
    (3, 11);

    INSERT INTO realm_bobadex_seasons(realm_id, bobadex_season_id, active)
    VALUES
        ((SELECT id FROM realms WHERE slug = 'twisted-minds'),  1, true),
        ((SELECT id FROM realms WHERE slug = 'twisted-minds'),  2, true),
        ((SELECT id FROM realms WHERE slug = 'uwu'),  1, false),
        ((SELECT id FROM realms WHERE slug = 'uwu'),  3, true);