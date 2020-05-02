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

describe("Tests threads REST API", () => {
  it("should return threads data", async () => {
    const res = await request(app).get(
      "/threads/29d1b2da-3289-454a-9089-2ed47db4967b"
    );

    expect(res.status).to.equal(200);
    expect(res.body).to.eql({
      id: "1",
      parent_board: "2",
      posts: [
        {
          anonymity_type: "strangers",
          author: 1,
          comments: null,
          content: '[{"insert":"Revolver Ocelot"}]',
          created: "2020-04-30T05:42:00",
          id: 1,
          is_deleted: false,
          parent_thread: 1,
          string_id: "619adf62-833f-4bea-b591-03e807338a8e",
          type: "text",
          whisper_tags: ["fight me on this"],
        },
        {
          content: '[{"insert":"Kermit the Frog"}]',
          created: "2020-04-30T05:47:00",
          id: 2,
          is_deleted: false,
          parent_thread: 1,
          string_id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
          type: "text",
          whisper_tags: [
            "Im too ashamed to admit this ok",
            "sorry mom",
            "YOU WILL NEVER KNOW WHO I AM",
          ],
          anonymity_type: "everyone",
          author: 3,
          comments: [
            {
              anonymity_type: "strangers",
              author: 1,
              content: '[{"insert":"OMG ME TOO"}]',
              created: "2020-04-30T05:52:00",
              id: 1,
              image_reference_id: null,
              is_deleted: false,
              parent_comment: null,
              parent_post: 2,
              string_id: "46a16199-33d1-48c2-bb79-4d4095014688",
            },
            {
              anonymity_type: "strangers",
              author: 1,
              content: '[{"insert":"friends!!!!!"}]',
              created: "2020-04-30T05:52:00",
              id: 2,
              image_reference_id: null,
              is_deleted: false,
              parent_comment: null,
              parent_post: 2,
              string_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
            },
          ],
        },
      ],
      string_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
      title: "Favorite character to maim?",
    });
  });
});
