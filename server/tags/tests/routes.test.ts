import "mocha";
import { expect } from "chai";
import request from "supertest";
import express, { Express } from "express";
import router from "../routes";
import { Server } from "http";

import debug from "debug";
const log = debug("bobaserver:tags:routes");

describe("Tests tags REST API", () => {
  let app: Express;
  let listener: Server;
  beforeEach(function (done) {
    app = express();
    app.use(router);
    listener = app.listen(4000, () => {
      done();
    });
  });
  afterEach(function (done) {
    listener.close(done);
  });
  it("should implement the new tag api I added", async () => {
    //const res = await request(app).get("/search?tags=tagone,tagtwo,tagthree&exclude=notone,nottwo");
    //const res = await request(app).get("/search?tags=tagone&tags=tagtwo&tags=tagthree&exclude=notone&exclude=nottwo");
    const res = await request(app).get("/search?tags=evil&tags=evil&exclude=notevil&exclude=notevil");
    expect(res.status).to.equal(200);
    expect(res.body[1]).to.eql({
      tags : "tagone,tagtwo,tagthree",
      exclude : "notone,nottwo"
    });
  });


});
