import express, { Express } from "express";
import { getBoardBySlug, getBoards } from "../queries";

import { Server } from "http";
import router from "../routes";

const extractRestrictions = (board: any) => {
  return {
    logged_in_base_restrictions: board.logged_in_base_restrictions,
    logged_out_restrictions: board.logged_out_restrictions,
  };
};

describe("Tests restricted board queries", () => {
  let app: Express;
  let listener: Server;
  beforeEach((done) => {
    app = express();
    app.use(router);
    listener = app.listen(4000, () => {
      done();
    });
    process.env.FORCED_USER = undefined;
  });
  afterEach((done) => {
    listener.close(done);
    process.env.FORCED_USER = undefined;
  });
  describe("tests logged-in-only board fetch", () => {
    describe("DB queries", () => {
      it("board fetch contains lock access restriction for logged out users", async () => {
        const board = await getBoardBySlug({
          slug: "restricted",
          // Oncest
          firebaseId: "fb3",
        });

        expect(extractRestrictions(board)).toEqual({
          logged_in_base_restrictions: [],
          logged_out_restrictions: ["lock_access"],
        });
      });

      it("board fetch contains lock access restriction for logged out users", async () => {
        const boards = await getBoards({
          firebaseId: "fb3",
        });

        expect(
          extractRestrictions(
            boards.find((board: any) => board.slug == "restricted")
          )
        ).toEqual({
          logged_in_base_restrictions: [],
          logged_out_restrictions: ["lock_access"],
        });
      });
    });
  });
});
