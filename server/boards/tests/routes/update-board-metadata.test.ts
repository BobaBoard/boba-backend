import { BOBATAN_USER_ID, JERSEY_DEVIL_USER_ID } from "test/data/auth.js";
import type {
  BoardCategoryDescription,
  BoardTextDescription,
} from "types/rest/boards.js";
import { CacheKeys, cache } from "server/cache.js";
import { GORE_BOARD_ID, GORE_BOARD_METADATA } from "test/data/boards.js";
import {
  setLoggedInUser,
  startTestServer,
  wrapWithTransaction,
} from "utils/test-utils.js";

import request from "supertest";
import router from "../../routes.js";

vi.mock("server/cache.js");
vi.mock("handlers/auth.js");
vi.mock("server/db-pool.js");

const UPDATED_TEXT_DESCRIPTION: BoardTextDescription = {
  id: "d92b0008-36d6-47a2-b4b1-21dce0027588",
  index: 1,
  title: "this is a new text description",
  type: "text",
  description: '[{"insert":"this is an updated text description\n"}]',
};

const UPDATED_CATEGORY_DESCRIPTION: BoardCategoryDescription = {
  id: "6dd1becf-b846-4b58-8c62-444ccf6951dc",
  index: 2,
  title: "this is a new text description",
  type: "category_filter",
  categories: ["blood", "bruises", "viscera"],
};

describe("Tests boards REST API", () => {
  const server = startTestServer(router);

  test("Should return 401 if user is not logged in", async () => {
    const res = await request(server.app).patch(`/${GORE_BOARD_ID}`);

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
    const res = await request(server.app).patch(`/${GORE_BOARD_ID}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      message: `User does not have required permissions for board operation.`,
    });
  });

  test("Should update board metadata", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      const res = await request(server.app).patch(`/${GORE_BOARD_ID}`).send({
        descriptions: [],
        accentColor: "red",
        tagline: "a new tagline",
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...GORE_BOARD_METADATA.BOBATAN,
        accent_color: "red",
        tagline: "a new tagline",
        descriptions: [],
      });
    });
  }, 10000);

  test("Should correctly handle cache", async () => {
    await wrapWithTransaction(async () => {
      setLoggedInUser(BOBATAN_USER_ID);
      await request(server.app).patch(`/${GORE_BOARD_ID}`).send({
        descriptions: [],
        accentColor: "red",
        tagline: "a new tagline",
      });

      // NOTE: We only save the metadata when the user is not logged in,
      // so we don't do it in this method.
      // Ensure that the board metadata was removed from the cache.
      expect(cache().hDel).toBeCalledTimes(2);
      expect(cache().hDel).toBeCalledWith(CacheKeys.BOARD, GORE_BOARD_ID);
      expect(cache().hDel).toBeCalledWith(
        CacheKeys.BOARD_METADATA,
        GORE_BOARD_ID
      );
    });
  }, 10000);

  // TODO: I have no idea why but sometimes tests decide they should not
  // pass on CI.
  // Periodically, try to remove this cause sometimes they start passing again.
  describe("ci-disable", () => {
    test("Should update board descriptions", async () => {
      await wrapWithTransaction(async () => {
        setLoggedInUser(BOBATAN_USER_ID);
        const res = await request(server.app)
          .patch(`/${GORE_BOARD_ID}`)
          .send({
            descriptions: [
              UPDATED_CATEGORY_DESCRIPTION,
              UPDATED_TEXT_DESCRIPTION,
            ],
          });

        expect(res.status).toBe(200);
        expect(res.body.descriptions.length).toEqual(2);
        expect(res.body.descriptions).toEqual(
          expect.arrayContaining([
            expect.objectContaining(UPDATED_CATEGORY_DESCRIPTION),
            expect.objectContaining(UPDATED_TEXT_DESCRIPTION),
          ])
        );
      });
    }, 10000);
  });
});
