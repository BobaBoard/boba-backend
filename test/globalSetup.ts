import debug from "debug";
import sinon from "sinon";
import { cache, initCache } from "../server/cache";

const info = debug("bobaserver:test:globalSetup-info");
info("Stubbing cache methods");

initCache(() => ({
  on: sinon.stub(),
  error: sinon.stub(),
  set: sinon.stub(),
  get: sinon.stub(),
  del: sinon.stub(),
  hset: sinon.stub(),
  hget: sinon.stub(),
  hdel: sinon.stub(),
}));

export const mochaHooks = {
  beforeEach() {
    info("Mocking RedisClient for use in test.");
    this.hsetStub = sinon.stub(cache(), "hset");
    this.hgetStub = sinon.stub(cache(), "hget");
    this.setStub = sinon.stub(cache(), "set");
    this.getStub = sinon.stub(cache(), "get");
  },
  afterEach() {
    this.hsetStub.restore();
    this.hgetStub.restore();
    this.setStub.restore();
    this.getStub.restore();
  },
};
