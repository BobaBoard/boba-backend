import {
    BOBATAN_USER_ID,
    JERSEY_DEVIL_USER_ID
} from "test/data/auth";
import {
    setLoggedInUser,
    startTestServer,
} from "utils/test-utils";

import request from "supertest";
import router from "../routes";

jest.mock("handlers/auth");
jest.mock("server/db-pool");

describe("Checking ensureAdmin through invites", () => {
    const server = startTestServer(router);
    
    test("Should authenticate Bobatan", async () => {
        setLoggedInUser(BOBATAN_USER_ID);
        const res = await request(server.app).post(
            `/invite/generate`
        );
        
        expect(res.status).toBe(200);
    });
    
    test("Should fail to authenticate non-admin user", async () => {
        setLoggedInUser(JERSEY_DEVIL_USER_ID);
        const res = await request(server.app).post(
            `/invite/generate`
        );
        
        expect(res.status).toBe(403);
    });

/*    test("Should successfully generate invite as admin", async () => {
        setLoggedInUser(BOBATAN_USER_ID);
    });

    test("Should fail to generate invite as non-admin user", async () => {
        setLoggedInUser(JERSEY_DEVIL_USER_ID);
    });*/
    
});