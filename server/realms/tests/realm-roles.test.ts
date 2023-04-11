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
          user_firebase_id: 'c6HimTlg2RhVH3fC1psXZORdLcx2',
          username: 'bobatan',
          role_string_id: '3df1d417-c36a-43dd-aaba-9590316ffc32',
          role_name: 'The Owner',
          label: 'Look ma, a label'
        },
        {
          user_firebase_id: 'c6HimTlg2RhVH3fC1psXZORdLcx2',
          username: 'bobatan',
          role_string_id: 'e5f86f53-6dcd-4f15-b6ea-6ca1f088e62d',
          role_name: 'GoreMaster5000',
          label: 'we have fun here'
        },
        {
          user_firebase_id: 'fb4',
          username: 'SexyDaddy69',
          role_string_id: '3df1d417-c36a-43dd-aaba-9590316ffc32',
          role_name: 'The Owner',
          label: 'well earned'
        },
        {
          user_firebase_id: 'fb3',
          username: 'oncest5evah',
          role_string_id: 'e5f86f53-6dcd-4f15-b6ea-6ca1f088e62d',
          role_name: 'GoreMaster5000',
          label: ''
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
