import "mocha";
import { expect } from "chai";

import request from "supertest";
import express, { Express } from "express";
import router from "../routes";
import { Server } from "http";
import { getBoardActivityBySlug, getBoardBySlug, getBoards } from "../queries";

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
    describe("REST API", async () => {
      // TODO: figure out mocking of firebase AUTH
      //   it("fetches board details when logged in (REST)", async () => {
      //   });

      it("doesn't fetch board details in all boards query when logged out (REST)", async () => {
        const res = await request(app).get("/");

        expect(res.status).to.equal(200);
        expect(
          res.body.find((board: any) => board.slug == "restricted")
        ).to.eql({
          avatarUrl:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2Fe4e263cf-ee98-4902-9c14-c10299210e01.png?alt=media&token=7c170411-9401-4d4e-9f66-5d6dfee2fccd",
          loggedInOnly: true,
          settings: {
            accentColor: "#234a69",
          },
          slug: "restricted",
          tagline: "A board to test for logged-in only view",
        });
      });

      it("doesn't fetch board details when logged out (REST)", async () => {
        const res = await request(app).get("/restricted");

        expect(res.status).to.equal(200);
        expect(res.body).to.eql({
          avatar:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2Fe4e263cf-ee98-4902-9c14-c10299210e01.png?alt=media&token=7c170411-9401-4d4e-9f66-5d6dfee2fccd",
          logged_in_only: true,
          accent_color: "#234a69",
          id: "restricted",
          delisted: false,
          descriptions: [],
          realm_id: "v0-fake-id",
          slug: "restricted",
          tagline: "A board to test for logged-in only view",
        });
      });

      it("doesn't fetch board activity when logged out (REST)", async () => {
        const res = await request(app).get("/restricted/activity/latest");

        expect(res.status).to.equal(403);
        expect(res.body).to.eql({});
      });
    });
  });
});
