import express, { Express } from "express";

import { Server } from "http";
import request from "supertest";
import router from "../../routes";

describe("Test feed of restricted boards", () => {
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

  describe("REST API", () => {
    it("doesn't fetch board activity when logged out (REST)", async () => {
      const res = await request(app).get("/boards/restricted");

      expect(res.status).toBe(403);
      expect(res.body).toEqual({});
    });
  });
});
