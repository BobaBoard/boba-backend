import { BOBATAN_USER_ID, JERSEY_DEVIL_USER_ID } from "test/data/auth";
import { CacheKeys, cache } from "server/cache";
import { GORE_BOARD_ID, GORE_BOARD_METADATA } from "test/data/boards";
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

  test("Should return 401 if user is not logged in", async () => {
    const res = await request(server.app).delete(`/${GORE_BOARD_ID}`);

    expect(res.status).toBe(401);
  });

  it("Should return 404 if board does not exist", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).delete("/this_board_does_not_exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      message: `The board with id "this_board_does_not_exist" was not found.`,
    });
  });

  it("Should delete board for user with permissions", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app).delete(`/${GORE_BOARD_ID}`);

      expect(res.status).toBe(204);
    });
  });

  it("Should return 404 after a board has been succesfully deleted", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app).delete(`/${GORE_BOARD_ID}`);

      expect(res.status).toBe(204);

      const deletedBoard = await request(server.app).get(`/${GORE_BOARD_ID}`);
      expect(deletedBoard.status).toBe(404);
    });
  });

  it.todo("Should not allow unauthenticated users to delete boards");
  it.todo("Should not allow non-admin/non-owner users to delete boards");
  it.todo("Should return 400 for invalid board ID format");
  it.todo("Should delete all posts associated with the board");
  it.todo("");

  /*  test.todo("Should return 401 if user is not logged in", async () => {
    const res = await request(server.app).delete(`/${GORE_BOARD_ID}`);

    expect(res.status).toBe(401);
  });



  test("Should return 403 if user does not have required permissions", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).delete(`/${GORE_BOARD_ID}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      message: `User does not have required permissions for board operation.`,
    });
  }); */
});
