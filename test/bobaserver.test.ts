import "mocha";
import { expect } from "chai";
import request from "supertest";

import app from "../server/bobaserver";

describe("Tests boards REST API", () => {
  it("should return board data", async () => {
    const res = await request(app).get("/").send();
    expect(res.status).to.equal(200);
    expect(res.body[0]).to.eql({
      author: "3",
      avatar: null,
      content: "Hi this is  a second thread",
      description: "Everything the light touches is dead doves.",
      id: "2",
      parentboard: "2",
      settings: {},
      stringid: "gore",
      title: "Gore Central",
    });
  });
});
