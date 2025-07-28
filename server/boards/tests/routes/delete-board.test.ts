import { BOBATAN_USER_ID, JERSEY_DEVIL_USER_ID } from "test/data/auth";

import { GORE_BOARD_ID } from "test/data/boards";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

import debug from "debug";
import request from "supertest";
import router from "../../routes";

const log = debug("bobaserver:test:boards:routes:delete-board-log");

jest.mock("server/cache");
jest.mock("handlers/auth");
jest.mock("server/db-pool");
jest.setTimeout(20000);

describe("DELETE /board/:board_id", () => {
  const server = startTestServer(router);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should return 401 if user is not logged in", async () => {
    await wrapWithTransaction(async () => {
      const res = await request(server.app).delete(`/${GORE_BOARD_ID}`);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        message: "No authenticated user found.",
      });
    });
  });

  test("Should return 403 if user does not have required permissions", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(JERSEY_DEVIL_USER_ID);
      const res = await request(server.app).delete(`/${GORE_BOARD_ID}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        message: `User does not have required permissions for board operation.`,
      });
    });
  });

  test("Should return 404 if board does not exist", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app).delete(
        "/this_board_does_not_exist"
      );

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        message: `The board with id "this_board_does_not_exist" was not found.`,
      });
    });
  });

  test("Should delete board for user with permissions", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app).delete(`/${GORE_BOARD_ID}`);

      expect(res.status).toBe(204);
    });
  });

  test("Should return 404 after a board has been succesfully deleted", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app).delete(`/${GORE_BOARD_ID}`);

      expect(res.status).toBe(204);

      const deletedBoard = await request(server.app).get(`/${GORE_BOARD_ID}`);
      expect(deletedBoard.status).toBe(404);
    });
  });

  test.todo("Should delete a board with posts with all types of tags");
  test.todo("Should delete an empty board");
  test.todo("Should delete a board with posts");
  test.todo("Should delete a board with posts with no tags");
  test.todo("Should delete a board with posts with all types of tags");
  test.todo("Should delete a board with a description");
});
