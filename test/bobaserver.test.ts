import "mocha";
import { expect } from "chai";
import request from "supertest";

import app from "../server/bobaserver";

describe("Tests boards REST API", () => {
  it("should return board data", async () => {
    const res = await request(app).get("/boards").query({
      boardId: "gore",
    });

    expect(res.status).to.equal(200);
    expect(res.body[0]).to.eql({
      boardtitle: "Gore Central",
      boarddescription: "Everything the light touches is dead doves.",
      boardavatar: null,
      boardid: "gore",
      threadcontent: "Hi this is  a second thread",
      threadauthor: "oncest5evah",
    });
  });
});
