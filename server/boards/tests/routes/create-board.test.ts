import { ANON_WITH_NO_NAME_USER_ID, BOBATAN_USER_ID } from "test/data/auth";
import {
  ENSURE_BOARD_PERMISSIONS_UNAUTHORIZED,
  ENSURE_LOGGED_IN_NO_TOKEN,
} from "test/data/responses";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

import { GenericResponse } from "types/rest/responses";
import { mocked } from "ts-jest/utils";
import request from "supertest";
import router from "../../routes";

jest.mock("handlers/auth");
jest.mock("server/cache");
jest.mock("server/db-pool");
jest.mock("axios");

const CREATE_BOARD_REQUEST = {
  slug: "new-board",
  category_id: 1,
  tagline: "tagline",
  avatar_url: "https://example.com/avatar.png",
  settings: '{ "accentColor": "#7b00ff"}',
};

describe("#POST /board", () => {
  const server = startTestServer(router);

  test("fails when user is unauthenticated", async () => {
    await wrapWithTransaction(async () => {
      const res = await request(server.app)
        .post("/")
        .send(CREATE_BOARD_REQUEST);

      expect(res.status).toBe(401);
      expect(res.body).toEqual<GenericResponse>(ENSURE_LOGGED_IN_NO_TOKEN);
    });
  });

  test.todo(
    "fails when route does not have a realm id"
    // async () => {
    // await wrapWithTransaction(async () => {
    //   setLoggedInUser(BOBATAN_USER_ID);
    //   const res = await request(server.app)
    //     .post("/")
    //     .send(CREATE_BOARD_REQUEST);

    //   expect(res.status).toBe(500);
    //   expect(res.body).toEqual(
    //     "Realm permissions can only be fetched on a route that includes a realm id."
    //   );
    // });
    // }
  );

  test.todo(
    "fails when user does not have permission to create board"
    // async () => {
    //   await wrapWithTransaction(async () => {
    //     setLoggedInUser(ANON_WITH_NO_NAME_USER_ID);
    //     const res = await request(server.app)
    //       .post("/")
    //       .send(CREATE_BOARD_REQUEST);

    //     expect(res.status).toBe(403);
    //     expect(res.body).toEqual<GenericResponse>(
    //       ENSURE_BOARD_PERMISSIONS_UNAUTHORIZED
    //     );
    //   });
    // }
  );

  test("creates board", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .post("/")
        .send(CREATE_BOARD_REQUEST);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("slug");
      expect(res.body).not.toHaveProperty("string_id");
      expect(res.body.slug).toBe("new-board");
    });
  });
});
