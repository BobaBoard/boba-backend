import debug from "debug";
import { getLatestSubscriptionData } from "../queries";

const log = debug("bobaserver:posts:queries-test-log");

describe("Tests posts queries", () => {
  test("adds index tags to post (and database)", async () => {
    const data = await getLatestSubscriptionData({
      subscriptionId: "a87800a6-21e5-46dd-a979-a901cdcea563",
    });
    console.log(data);

    expect(data).toIncludeSameMembers([
      {
        subscription_id: "3",
        subscription_name: "aiba!",
        subscription_string_id: "a87800a6-21e5-46dd-a979-a901cdcea563",
        last_updated: "2020-08-22T03:36:18",
        secret_identity_name: null,
        secret_identity_avatar: null,
        secret_identity_color: null,
        secret_identity_accessory: null,
        post_content:
          '[{"insert":{"block-image":{"src":"https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmemes%2F2765f36a-b4f9-4efe-96f2-cb34f055d032%2F7707f104-044c-4111-b422-74e11ccef4a2?alt=media&token=7cdf3edb-0d63-467e-ade6-05447cc602c3","spoilers":false,"width":1920,"height":1080}}},{"insert":""}]',
        latest_post_string_id: "7f76ddaf-06f0-44fa-85d5-2e5ad5d447aa",
        thread_string_id: "2765f36a-b4f9-4efe-96f2-cb34f055d032",
      },
    ]);
  });
});
