import express, { Express } from "express";

import { Server } from "http";
import debug from "debug";
import request from "supertest";
import router from "../../routes";

const log = debug("bobaserver:board:routes");
jest.mock("../../../cache");

describe("Tests boards REST API", () => {
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
  it("should return board data (logged out)", async () => {
    const res = await request(app).get("/gore");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      descriptions: [
        {
          categories: ["blood", "bruises"],
          description: null,
          id: "id1",
          index: 2,
          title: "Gore Categories",
          type: "category_filter",
        },
        {
          categories: null,
          description: '[{"insert": "pls b nice"}]',
          id: "id2",
          index: 1,
          title: "Gore description",
          type: "text",
        },
      ],
      accent_color: "#f96680",
      id: "gore",
      slug: "gore",
      realm_id: "v0-fake-id",
      tagline: "Blood! Blood! Blood!",
      avatar_url: "/gore.png",
      delisted: false,
      logged_in_only: false,
    });
  });
});
