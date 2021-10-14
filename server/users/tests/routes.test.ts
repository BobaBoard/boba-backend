import express, { Express } from "express";

import { Server } from "http";
import debug from "debug";
import { ensureLoggedIn } from "../../../handlers/auth";
import { getUserFromFirebaseId } from "../queries";
import { mocked } from "ts-jest/utils";
import request from "supertest";
import router from "../routes";
import sinon from "sinon";

jest.mock("../../cache");
jest.mock("../../../handlers/auth");
const log = debug("bobaserver:test:users:routes-log");

describe("Test users routes", () => {
  let app: Express;
  let listener: Server;
  beforeEach((done) => {
    app = express();
    app.use(router);
    listener = app.listen(4000, () => {
      done();
    });
  });
  afterEach((done) => {
    listener.close(done);
  });

  it("gets user from id", async () => {
    const user = await getUserFromFirebaseId({ firebaseId: "fb2" });

    expect(user).toEqual({
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
    //   expect(authStub.called).toBe(false);
    //   authStub.callsFake((req, res, next) => {
    //     log("Overriding current user");
    //     // @ts-ignore
    //     req.currentUser = { uid: "fb2" };
    //     next();
    //   });
    const res = await request(app).get("/@me");
    expect(res.status).toBe(401);
    // expect(authStub.called).toBe(true);
  });

  it("returns data for the logged in user", async () => {
    // authStub.callsFake((req, res, next) => {
    //   log("Overriding current user");
    //   // @ts-ignore
    //   req.currentUser = { uid: "fb2" };
    //   next();
    // });
    mocked(ensureLoggedIn).mockImplementation((req, res, next) => {
      // @ts-ignore
      req.currentUser = { uid: "fb2" };
      next();
    });
    const res = await request(app).get("/@me");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      avatar_url: "/hannibal.png",
      username: "jersey_devil_69",
      pinned_boards: {},
    });

    mocked(ensureLoggedIn).mockRestore();
  });

  it("Calls ensureLoggedIn to prevent unauthorized access 2", async () => {
    //   expect(authStub.called).toBe(false);
    //   authStub.callsFake((req, res, next) => {
    //     log("Overriding current user");
    //     // @ts-ignore
    //     req.currentUser = { uid: "fb2" };
    //     next();
    //   });
    const res = await request(app).get("/@me");
    expect(res.status).toBe(401);
    // expect(authStub.called).toBe(true);
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
