import "mocha";
import { expect } from "chai";
import request from "supertest";
import express, { Express } from "express";
import router from "../routes";
import { Server } from "http";

import debug from "debug";
const log = debug("bobaserver:tags:routes");

const FAVE_TO_MAIM_POST_ID = "11b85dac-e122-40e0-b09a-8829c5e0250e";
const REVOLVER_OCELOT_POST_ID = "619adf62-833f-4bea-b591-03e807338a8e";
const KERMIT_THE_FROG_POST_ID = "b95bb260-eae0-456c-a5d0-8ae9e52608d8";

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

  it("should work with both one tags and one excludes", async () => {
    const res = await request(app).get("/search?tags=evil&exclude=oddly+specific");
    expect(res.status).to.equal(200);
    expect(res.body.length).to.equal(1);
    expect(res.body[0].string_id).to.equal(FAVE_TO_MAIM_POST_ID); // favorite character to maim?
  });

  it("should work with one tags only", async () => {
    const res = await request(app).get("/search?tags=evil");
    expect(res.status).to.equal(200);
    expect(res.body.length).to.equal(2);

    const responsePostIds = new Set(res.body.map( (r: any) => r.string_id ));

    expect(responsePostIds.has(FAVE_TO_MAIM_POST_ID)).to.be.true;
    expect(responsePostIds.has(REVOLVER_OCELOT_POST_ID)).to.be.true;
  });

  it("should send 400 if no tags and exclude", async () => {
    const res = await request(app).get("/search?exclude=evil");
    expect(res.status).to.equal(400);
  });

  it("should send 400 if no tags and no exclude", async () => {
    const res = await request(app).get("/search");
    expect(res.status).to.equal(400);
  });

  it("should work with multiple tags, returning posts that have ALL specified tags", async () => {
    const res = await request(app).get("/search?tags=oddly+specific&tags=good");
    expect(res.status).to.equal(200);
    expect(res.body.length).to.equal(1);

    const responsePostIds = new Set(res.body.map( (r: any) => r.string_id ));

    expect(responsePostIds.has(KERMIT_THE_FROG_POST_ID)).to.be.true;
  });

  it("should work with multiple excludes, not returning posts that have ANY specified tags", async () => {
    const res = await request(app).get("/search?tags=bobapost&exclude=oddly+specific&exclude=metal+gear");
    expect(res.status).to.equal(200);
    expect(res.body.length).to.equal(1);

    const responsePostIds = new Set(res.body.map( (r: any) => r.string_id ));

    expect(responsePostIds.has(FAVE_TO_MAIM_POST_ID)).to.be.true;
  });

});
