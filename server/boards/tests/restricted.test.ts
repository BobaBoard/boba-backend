import "mocha";
import { expect } from "chai";

import express, { Express } from "express";
import router from "../routes";
import { Server } from "http";
import { getBoardBySlug, getBoards } from "../queries";

const extractRestrictions = (board: any) => {
  return {
    logged_in_base_restrictions: board.logged_in_base_restrictions,
    logged_out_restrictions: board.logged_out_restrictions,
  };
};

describe("Tests restricted board queries", () => {
  let app: Express;
  let listener: Server;
  beforeEach(function (done) {
    app = express();
    app.use(router);
    listener = app.listen(4000, () => {
      done();
    });
    process.env.FORCED_USER = undefined;
  });
  afterEach(function (done) {
    listener.close(done);
    process.env.FORCED_USER = undefined;
  });
  describe("tests logged-in-only board fetch", async () => {
    describe("DB queries", async () => {
      it("board fetch contains lock access restriction for logged out users", async () => {
        const board = await getBoardBySlug({
          slug: "restricted",
          // Oncest
          firebaseId: "fb3",
        });

        expect(extractRestrictions(board)).to.eql({
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
        ).to.eql({
          logged_in_base_restrictions: [],
          logged_out_restrictions: ["lock_access"],
        });
      });
    });
  });
});
