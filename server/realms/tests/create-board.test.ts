import { ANON_WITH_NO_NAME_USER_ID, BOBATAN_USER_ID } from "test/data/auth";
import {
  ENSURE_LOGGED_IN_NO_TOKEN,
  ENSURE_REALM_PERMISSIONS_UNAUTHORIZED,
} from "test/data/responses";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

import { GenericResponse } from "types/rest/responses";
import { TWISTED_MINDS_REALM_EXTERNAL_ID } from "test/data/realms";
import request from "supertest";
import router from "../routes";

jest.mock("handlers/auth");
jest.mock("server/cache");
jest.mock("server/db-pool");
jest.mock("axios");

// Uses the format: /:realm_id/board
const CREATE_BOARD_ROUTE = `/${TWISTED_MINDS_REALM_EXTERNAL_ID}/boards`;

const CREATE_BOARD_REQUEST = {
  slug: "new-board",
  category_id: "9449bcab-fa55-4b0e-9ce0-438501e5fa79",
  tagline: "tagline",
  avatar_url: "https://example.com/avatar.png",
  settings: '{ "accentColor": "#7b00ff"}',
};

describe("#POST /board", () => {
  const server = startTestServer(router);

  test("fails when user is unauthenticated", async () => {
    await wrapWithTransaction(async () => {
      const res = await request(server.app)
        .post(CREATE_BOARD_ROUTE)
        .send(CREATE_BOARD_REQUEST);

      expect(res.status).toBe(401);
      expect(res.body).toEqual<GenericResponse>(ENSURE_LOGGED_IN_NO_TOKEN);
    });
  });

  test("fails when route does not have a valid realm id", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .post("/realms/invalid/boards")
        .send(CREATE_BOARD_REQUEST);

      expect(res.status).toBe(404);
    });
  });

  test("fails when user does not have the realm permission to create board", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(ANON_WITH_NO_NAME_USER_ID);
      const res = await request(server.app)
        .post(CREATE_BOARD_ROUTE)
        .send(CREATE_BOARD_REQUEST);

      expect(res.status).toBe(403);
      expect(res.body).toEqual<GenericResponse>(
        ENSURE_REALM_PERMISSIONS_UNAUTHORIZED
      );
    });
  });

  test("creates board", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .post(CREATE_BOARD_ROUTE)
        .send(CREATE_BOARD_REQUEST);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("slug");
      expect(res.body).not.toHaveProperty("string_id");
      expect(res.body.slug).toBe("new-board");
    });
  });
});
