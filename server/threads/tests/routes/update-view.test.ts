import { setLoggedInUser, startTestServer } from "utils/test-utils";

import request from "supertest";
import router from "../../routes";
import { wrapWithTransaction } from "../../../../utils/test-utils";

jest.mock("handlers/auth");

const CHARACTER_TO_MAIM_THREAD_ID = "29d1b2da-3289-454a-9089-2ed47db4967b";

describe("Tests update view REST API", () => {
  const server = startTestServer(router);

  test("should prevent access if permissions missing", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser("fb2");
      const res = await request(server.app)
        .post(`/${CHARACTER_TO_MAIM_THREAD_ID}/update/view`)
        .send({
          defaultView: "gallery",
        });
      expect(res.status).toBe(403);
    });
  });

  test("should update view data", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser("fb3");
      const res = await request(server.app)
        .post(`/${CHARACTER_TO_MAIM_THREAD_ID}/update/view`)
        .send({
          defaultView: "gallery",
        });
      expect(res.status).toBe(200);
      const threadRes = await request(server.app).get(
        `/${CHARACTER_TO_MAIM_THREAD_ID}`
      );
      expect(threadRes.status).toBe(200);
      expect(threadRes.body.default_view).toEqual("gallery");
    });
  });
});
