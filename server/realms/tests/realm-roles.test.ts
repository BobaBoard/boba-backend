import {
  BOBATAN_USER_ID,
} from "test/data/auth";
import {
	TWISTED_MINDS_REALM_EXTERNAL_ID,
	UWU_REALM_EXTERNAL_ID } from "test/data/realms";
import { setLoggedInUser, startTestServer } from "utils/test-utils";
import request from "supertest";
import router from "../routes";

jest.mock("handlers/auth");

describe("Tests realm role queries", () => {
  const server = startTestServer(router);

  test("fetches realm roles with permissions", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(`/${TWISTED_MINDS_REALM_EXTERNAL_ID}/roles`);
		console.log(res.body)
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      roles: [
        {
          user_id: '1',
          username: 'bobatan',
          role_id: '3',
          role_name: 'The Owner',
          label: 'Look ma, a label'
        },
        {
          user_id: '1',
          username: 'bobatan',
          role_id: '1',
          role_name: 'GoreMaster5000',
          label: 'we have fun here'
        },
        {
          user_id: '4',
          username: 'SexyDaddy69',
          role_id: '3',
          role_name: 'The Owner',
          label: 'well earned'
        },
        {
          user_id: '3',
          username: 'oncest5evah',
          role_id: '1',
          role_name: 'GoreMaster5000'
        }
      ]
    });
  });

	test("does not fetch realm roles without permissions", async () => {
    setLoggedInUser(BOBATAN_USER_ID);
    const res = await request(server.app).get(`/${UWU_REALM_EXTERNAL_ID}/roles`);
		console.log(res.body)
    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      message: 'User does not have required permissions for realm operation.'
    });
  });
});
