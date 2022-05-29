import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { BOBATAN_NOTIFICATIONS } from "test/data/notifications";
import { BOBATAN_USER_ID } from "test/data/auth";
import debug from "debug";
import request from "supertest";
import router from "../../routes";

const log = debug("bobaserver:board:routes");
jest.mock("server/cache");
jest.mock("handlers/auth");

describe("Tests boards REST API", () => {
  const server = startTestServer(router);

  test("should not return notifications data (logged out)", async () => {
    const res = await request(server.app).get(`/@me/notifications`);

    expect(res.status).toBe(401);
  });

  test("should return notifications data (logged in)", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(`/@me/notifications`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(BOBATAN_NOTIFICATIONS);
  });
  // TODO: check if any test user has outdated notifications or none, and test there
});

 describe("Tests boards REST API", () => {
  const server = startTestServer(router);

  test("should dismiss notifications", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).delete(`/@me/notifications`);
    
    expect(res.status).toBe(204);
  });
  
}); 
