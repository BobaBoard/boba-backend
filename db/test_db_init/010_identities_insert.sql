INSERT INTO secret_identities(id, external_id, display_name, avatar_reference_id) OVERRIDING SYSTEM VALUE 
VALUES
    (1, '85e33a3c-f987-41fd-a555-4c0cfdedf737', 'Old Time-y Anon', 'https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png'), 
    (2, '07f4cbbb-6a62-469e-8789-1b673a6d622f', 'DragonFucker', 'https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg'), 
    (3, '31eeb959-9a23-454a-b726-9c203a512520', 'Outdated Meme', 'outdated-meme.png'),
    (4, 'ed8a6fcb-9b94-4f98-94ff-d9c0b9f0e5c9', 'The Prophet', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2Fbe6d2b51-8192-4b78-a140-fecd1ec54f71?alt=media&token=4a13133b-f8fb-478b-9be4-22fa0f4a97c8'),
    (5, '88c258eb-c93f-4ac9-8271-1ac227c453ac', 'Him Free', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F4e72a52a-9fdd-4a49-a7f0-ffa56a46836d?alt=media&token=153015fa-c46b-4184-a17f-10c3e609bf70'),
    (6, '47bf62fa-755f-489f-9735-27c884a0dec3', 'The OG OG Komaeda', 'https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F1237fd9e-cd40-41b8-8ee7-11c865f27b6b?alt=media&token=4bb418a6-cb45-435c-85ed-7bdcb294f5b5');

INSERT INTO bobadex_seasons(id, external_id, name) OVERRIDING SYSTEM VALUE 
VALUES
    (1, '9f6d41a5-1e00-4071-9f50-555f1686f87f', 'Default'), 
    (2, '9b496931-ba27-43e0-953b-c38e01803879', 'Halloween');

INSERT INTO bobadex_season_secret_identities(bobadex_season_id, secret_identity_id)
VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (2, 4),
    (2, 5),
    (2, 6);