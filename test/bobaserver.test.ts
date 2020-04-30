import "mocha";
import { expect } from "chai";
import request from "supertest";

import app from "../server/bobaserver";

describe("Tests boards REST API", () => {
  it("should return board data", async () => {
    const res = await request(app).get("/boards/gore");

    expect(res.status).to.equal(200);
    expect(res.body).to.eql({
      title: "Gore Central",
      description: "Everything the light touches is dead doves.",
      avatar: null,
      slug: "gore",
      threadsCount: "2",
      settings: {},
    });
  });
});
