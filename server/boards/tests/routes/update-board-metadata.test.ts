import { BOBATAN_USER_ID, JERSEY_DEVIL_USER_ID } from "test/data/auth";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils";

import { GORE_BOARD_METADATA } from "test/data/boards";
import request from "supertest";
import router from "../../routes";

jest.mock("server/db-pool", () => ({
  ...jest.requireActual("server/db-pool").default,
  tx: (name: string, transaction: any) =>
    jest.requireActual("server/db-pool").default.txIf(
      {
        tag: name,
        cnd: false,
      },
      transaction
    ),
}));

jest.mock("../../../cache");
jest.mock("handlers/auth");

describe("Tests boards REST API", () => {
  const server = startTestServer(router);

  test("Should return 401 if user is not logged in", async () => {
    const res = await request(server.app).patch(
      "/c6d3d10e-8e49-4d73-b28a-9d652b41beec"
    );

    expect(res.status).toBe(401);
  });

  test("Should return 404 if board does not exist", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).patch("/this_board_does_not_exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      message: `The board with id "this_board_does_not_exist" was not found.`,
    });
  });

  test("Should return 403 if user does not have required permissions", async () => {
    setLoggedInUser(JERSEY_DEVIL_USER_ID);
    const res = await request(server.app).patch(
      "/c6d3d10e-8e49-4d73-b28a-9d652b41beec"
    );

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      message: `User cannot access board with id "c6d3d10e-8e49-4d73-b28a-9d652b41beec".`,
    });
  });

  test("Should update board metadata", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app)
        .patch("/c6d3d10e-8e49-4d73-b28a-9d652b41beec")
        .send({
          descriptions: [],
          accentColor: "red",
          tagline: "a new tagline",
        });

      // TODO: check board cache was deleted
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...GORE_BOARD_METADATA.BOBATAN,
        accent_color: "red",
        tagline: "a new tagline",
        descriptions: [],
      });
    });
  });
});
