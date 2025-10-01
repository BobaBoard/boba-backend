import { getLatestSubscriptionData } from "../queries.js";

describe("Tests posts queries", () => {
  test("adds index tags to post (and database)", async () => {
    const data = await getLatestSubscriptionData({
      subscriptionExternalId: "a87800a6-21e5-46dd-a979-a901cdcea563",
    });

    expect(data).toIncludeSameMembers([
      {
        subscription_id: "3",
        subscription_name: "aiba!",
        subscription_external_id: "a87800a6-21e5-46dd-a979-a901cdcea563",
        last_updated_at: "2020-08-22T03:36:18.00Z",
        secret_identity_avatar:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2F5c2c3867-2323-4209-8bd4-9dfcc88808f3%2Fd931f284-5c22-422d-9343-e509cfb44ffc.png?alt=media&token=94e52fff-4e6b-4110-94c3-90b8800f541c",
        secret_identity_name: "Old Time-y Anon",
        secret_identity_color: null,
        secret_identity_accessory: null,
        post_content:
          '[{"insert":{"block-image":{"src":"https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmemes%2F2765f36a-b4f9-4efe-96f2-cb34f055d032%2F7707f104-044c-4111-b422-74e11ccef4a2?alt=media&token=7cdf3edb-0d63-467e-ade6-05447cc602c3","spoilers":false,"width":1920,"height":1080}}},{"insert":""}]',
        latest_post_string_id: "7f76ddaf-06f0-44fa-85d5-2e5ad5d447aa",
        thread_external_id: "2765f36a-b4f9-4efe-96f2-cb34f055d032",
      },
    ]);
  });
});
