import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { AIBA_SUBSCRIPTION_ID } from "test/data/subscriptions";
import { BOBATAN_USER_ID } from "test/data/auth";
import { GenericResponse } from "types/rest/responses";
import { SubscriptionFeed } from "types/rest/subscriptions";
import request from "supertest";
import router from "../../routes";

jest.mock("server/cache");
jest.mock("handlers/auth");

describe("Tests threads REST API", () => {
  const server = startTestServer(router);

  test("should return subscription data (logged out)", async () => {
    const res = await request(server.app).get(`/${AIBA_SUBSCRIPTION_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual<SubscriptionFeed>({
      cursor: {
        next: null,
      },
      subscription: {
        id: "a87800a6-21e5-46dd-a979-a901cdcea563",
        last_activity_at: "2020-08-22T03:36:18.00Z",
        name: "aiba!",
      },
      activity: [
        {
          id: "7f76ddaf-06f0-44fa-85d5-2e5ad5d447aa",
          parent_thread_id: "2765f36a-b4f9-4efe-96f2-cb34f055d032",
          created_at: "2020-08-22T03:36:18.00Z",
          content:
            '[{"insert":{"block-image":{"src":"https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmemes%2F2765f36a-b4f9-4efe-96f2-cb34f055d032%2F7707f104-044c-4111-b422-74e11ccef4a2?alt=media&token=7cdf3edb-0d63-467e-ade6-05447cc602c3","spoilers":false,"width":1920,"height":1080}}},{"insert":""}]',
          friend: false,
          new: false,
          own: false,
          parent_post_id: null,
          secret_identity: {
            name: null,
            avatar: null,
          },
          tags: {
            category_tags: [],
            content_warnings: [],
            index_tags: [],
            whisper_tags: [],
          },
          total_comments_amount: 0,
          new_comments_amount: 0,
        },
      ],
    });
  });

  test("should return 404 when subscription does not exist", async () => {
    const res = await request(server.app).get(`/this_id_does_not_exist`);
    expect(res.status).toBe(404);
  });

  // test("should lock logged out access when board access restricted", async () => {
  //   const res = await request(server.app).get(`/${RESTRICTED_THREAD_ID}`);

  //   expect(res.status).toBe(401);
  // });

  // test("should allow logged in access when board access restricted", async () => {
  //   setLoggedInUser(BOBATAN_USER_ID);
  //   const res = await request(server.app).get(`/${RESTRICTED_THREAD_ID}`);

  //   expect(res.status).toBe(200);
  //   expect(res.body).toEqual<Thread>(RESTRICTED_THREAD);
  // });

  test("TODO: should lock when user does not have access to board", async () => {
    //setLoggedInUser(BOBATAN_USER_ID);
    //expect(res.status).toBe(403);
    //expect(res.body).toEqual<Thread>(RESTRICTED_THREAD);
  });

  // test("should fail when thread does not exist", async () => {
  //   setLoggedInUser(BOBATAN_USER_ID);
  //   const res = await request(server.app).get(`/${NULL_ID}`);

  //   expect(res.status).toBe(404);
  //   expect(res.body).toEqual<GenericResponse>(NULL_THREAD_NOT_FOUND);
  // });
});
