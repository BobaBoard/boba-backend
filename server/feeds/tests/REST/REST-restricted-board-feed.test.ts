import "mocha";
import { expect } from "chai";

import request from "supertest";
import express, { Express } from "express";
import router from "../../routes";
import { Server } from "http";

describe("Test feed of restricted boards", () => {
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

  describe("REST API", async () => {
    it("doesn't fetch board activity when logged out (REST)", async () => {
      const res = await request(app).get("/boards/restricted");

      expect(res.status).to.equal(403);
      expect(res.body).to.eql({});
    });
  });
});
