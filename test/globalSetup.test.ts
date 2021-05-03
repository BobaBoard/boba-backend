import debug from "debug";
import sinon from "sinon";

const info = debug("bobaserver:test:globalSetup-info");
info("Stubbing cache methods");

export const mochaHooks = {
  beforeAll() {},
  beforeEach() {
    const cacheObj = {
      on: sinon.stub(),
      error: sinon.stub(),
      set: sinon.stub(),
      get: sinon.stub(),
      del: sinon.stub(),
      hset: sinon.stub(),
      hget: sinon.stub(),
      hdel: sinon.stub(),
    };
    info("Mocking RedisClient for use in test.");
    this.hsetStub = cacheObj.hset;
    this.hgetStub = cacheObj.hget;
    this.hdelStub = cacheObj.hdel;
    this.setStub = cacheObj.set;
    this.getStub = cacheObj.get;
    const cache = require("../server/cache");
    if (this.cacheStub) {
      info("Restoring cache stub before mocking");
      // This is necessary because, for some reason, beforeEach is called twice
      // somewhere. I don't currently have time to figure out where or why.
      // TODO: figure this out.
      this.cacheStub.restore();
    }
    this.cacheStub = sinon.stub(cache, "cache");
    this.cacheStub.returns(cacheObj);
  },
  afterEach() {
    info("Restoring cache stub after mocking");
    this.cacheStub.restore();
  },
};
