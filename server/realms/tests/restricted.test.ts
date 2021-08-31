import "mocha";
import { expect } from "chai";

import request from "supertest";
import express, { Express } from "express";
import router from "../routes";
import { Server } from "http";

const extractRestrictions = (board: any) => {
  return {
    logged_in_base_restrictions: board.logged_in_base_restrictions,
    logged_out_restrictions: board.logged_out_restrictions,
  };
};

describe("Tests restricted board realm queries", () => {
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
    describe("REST API", async () => {
      // TODO: figure out mocking of firebase AUTH
      //   it("fetches board details when logged in (REST)", async () => {
      //   });

      it("doesn't fetch restricted board details in realm query when logged out", async () => {
        const res = await request(app).get("/slug/v0");

        expect(res.status).to.equal(200);
        expect(
          res.body.boards.find((board: any) => board.slug == "restricted")
        ).to.eql({
          id: "restricted",
          realm_id: "v0-fake-id",
          avatar_url:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2Fe4e263cf-ee98-4902-9c14-c10299210e01.png?alt=media&token=7c170411-9401-4d4e-9f66-5d6dfee2fccd",
          logged_in_only: true,
          delisted: false,
          accent_color: "#234a69",
          slug: "restricted",
          tagline: "A board to test for logged-in only view",
        });
      });
    });
  });
});
