import { TWISTED_MINDS_REALM_STRING_ID, UWU_REALM_STRING_ID } from "test/data/realms";
import {
    setLoggedInUser,
    startTestServer,
} from "utils/test-utils";

import { BOBATAN_USER_ID } from "test/data/auth";
import debug from "debug";
import request from "supertest";
import router from "../routes";

const log = debug("bobaserver:board:routes");
//  jest.mock("server/cache");
  jest.mock("handlers/auth");
  
  describe("Tests boards REST API", () => {
    const server = startTestServer(router);

    test("should not return bobadex data (logged out)", async () => {
        const res = await request(server.app).get(`/${TWISTED_MINDS_REALM_STRING_ID}/bobadex`);
    
        expect(res.status).toBe(401);
    });

    test("should return bobadex data for twisted minds realm (logged in)", async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app).get(`/${TWISTED_MINDS_REALM_STRING_ID}/bobadex`);
  
      expect(res.status).toBe(200);
    });

    // TODO: rewrite fetch-bobadex query to pull from specific realm
    test("should return bobadex data for uwu realm (logged in)", async () => {
        setLoggedInUser(BOBATAN_USER_ID);
        const res = await request(server.app).get(`/${UWU_REALM_STRING_ID}/bobadex`);
    
        expect(res.status).toBe(200);
      });
  });
  