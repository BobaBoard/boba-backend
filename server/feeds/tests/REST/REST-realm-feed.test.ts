import { setLoggedInUser, startTestServer } from "utils/test-utils";

import { BOBATAN_USER_ID } from "test/data/auth";
import { TWISTED_MINDS_REALM_EXTERNAL_ID } from "test/data/realms";
import debug from "debug";
import request from "supertest";
import router from "../../routes";

jest.mock("handlers/auth");

const log = debug("bobaserver:board:routes");
  
  describe("Tests Realm Activity Feed Endpoint", () => {
    const server = startTestServer(router);
  
    test("should return realm activity data" , async () => {
        setLoggedInUser(BOBATAN_USER_ID)
        const res = await request(server.app).get(`/realms/${TWISTED_MINDS_REALM_EXTERNAL_ID}`);
        
        expect(res.status).toBe(200);
        // TODO: switch to expect(res.body).toEqual(bobatan's expected realm activity feed)
        log(res.body); 
    });

    test("return realm activity results when user isn't logged in", async () => { 
        const res = await request(server.app).get(`/realms/${TWISTED_MINDS_REALM_EXTERNAL_ID}`);
        
        expect(res.status).toBe(401);
        expect(res.body).toEqual({message: "No authenticated user found."});
    });
  });
  