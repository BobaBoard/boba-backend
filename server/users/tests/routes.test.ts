import "mocha";
import { expect } from "chai";
import debug from "debug";
import express, { Express } from "express";
import request from "supertest";
import * as authHandler from "../../../handlers/auth";
import sinon from "sinon";

const authStub = sinon.stub(authHandler, "ensureLoggedIn");
import router from "../routes";
import { CacheKeys } from "../../cache";
import { Server } from "http";
import { getUserFromFirebaseId } from "../queries";
const log = debug("bobaserver:test:users:routes-log");

describe("Test users routes", function () {
  let app: Express;
  let listener: Server;
  beforeEach(function (done) {
    authStub.callsFake((req, res, next) => {
      next();
    });
    app = express();
    app.use(router);
    listener = app.listen(4000, () => {
      done();
    });
  });
  afterEach(function (done) {
    authStub.restore();
    listener.close(done);
  });

  it("gets user from id", async () => {
    const user = await getUserFromFirebaseId({ firebaseId: "fb2" });

    expect(user).to.eql({
      avatar_reference_id: "hannibal.png",
      created_on: null,
      firebase_id: "fb2",
      id: "2",
      invited_by: "1",
      username: "jersey_devil_69",
    });
  });

  // TODO: reactivate this once cache is fixed.
  // it("returns data logged in user (cached)", async function () {
  //   const cachedData = {
  //     avatarUrl: "/this_was_cached.png",
  //     username: "super_cached",
  //   };
  //   log(cachedData);
  //   // @ts-ignore
  //   authStub.callsFake((req, res, next) => {
  //     log("Overriding current user");
  //     // @ts-ignore
  //     req.currentUser = { uid: "fb2" };
  //     next();
  //   });

  //   this.hgetStub
  //     .withArgs(CacheKeys.USER, "fb2")
  //     .resolves(JSON.stringify(cachedData));

  //   const res = await request(app).get("/@me");
  //   log(res.body);
  //   expect(res.status).to.equal(200);
  //   expect(res.body).to.eql(cachedData);
  // });

  it("Calls ensureLoggedIn to prevent unauthorized access", async () => {
    expect(authStub.called).to.be.false;
    authStub.callsFake((req, res, next) => {
      log("Overriding current user");
      // @ts-ignore
      req.currentUser = { uid: "fb2" };
      next();
    });
    await request(app).get("/@me");
    expect(authStub.called).to.be.true;
  });

  it("returns data for the logged in user", async () => {
    authStub.callsFake((req, res, next) => {
      log("Overriding current user");
      // @ts-ignore
      req.currentUser = { uid: "fb2" };
      next();
    });
    const res = await request(app).get("/@me");
    expect(res.status).to.equal(200);
    expect(res.body).to.eql({
      avatar_url: "/hannibal.png",
      username: "jersey_devil_69",
      pinned_boards: {},
    });
  });

  // TODO: reactivate this once cache is fixed.
  // it("caches logged in user data", async function () {
  //   // @ts-ignore
  //   authStub.callsFake((req, res, next) => {
  //     log("Overriding current user");
  //     // @ts-ignore
  //     req.currentUser = { uid: "fb2" };
  //     next();
  //   });
  //   await request(app).get("/@me");
  //   sinon.assert.calledOnceWithMatch(this.hsetStub, CacheKeys.USER, "fb2");
  // });
});
