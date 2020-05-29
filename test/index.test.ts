import "mocha";
import { expect } from "chai";
import request from "supertest";

import app from "../server";

describe("Tests boards REST API", () => {
  it("should return board data", async () => {
    const res = await request(app).get("/boards/gore");

    expect(res.status).to.equal(200);
    expect(res.body).to.eql({
      settings: {
        accentColor: "#f96680",
      },
      slug: "gore",
      tagline: "Blood! Blood! Blood!",
      threadsCount: "2",
      avatarUrl: "/gore.png",
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
      string_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
      parent_board: "2",
      posts: [
        {
          id: 1,
          string_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          parent_thread: 1,
          parent_post: null,
          author: 3,
          created: "2020-04-30T03:23:00",
          content: '[{"insert":"Favorite character to maim?"}]',
          type: "text",
          whisper_tags: null,
          is_deleted: false,
          anonymity_type: "strangers",
          comments: null,
        },
        {
          id: 2,
          string_id: "619adf62-833f-4bea-b591-03e807338a8e",
          parent_thread: 1,
          parent_post: 1,
          author: 1,
          created: "2020-05-01T05:42:00",
          content: '[{"insert":"Revolver Ocelot"}]',
          type: "text",
          whisper_tags: ["fight me on this"],
          is_deleted: false,
          anonymity_type: "strangers",
          comments: null,
        },
        {
          id: 3,
          string_id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
          parent_thread: 1,
          parent_post: 1,
          author: 3,
          created: "2020-05-02T06:04:00",
          content: '[{"insert":"Kermit the Frog"}]',
          type: "text",
          whisper_tags: [
            "Im too ashamed to admit this ok",
            "sorry mom",
            "YOU WILL NEVER KNOW WHO I AM",
          ],
          is_deleted: false,
          anonymity_type: "everyone",
          comments: [
            {
              id: 1,
              string_id: "46a16199-33d1-48c2-bb79-4d4095014688",
              parent_thread: 1,
              parent_post: 3,
              parent_comment: null,
              author: 1,
              created: "2020-04-30T00:22:00",
              content: '[{"insert":"OMG ME TOO"}]',
              image_reference_id: null,
              is_deleted: false,
              anonymity_type: "strangers",
            },
            {
              id: 2,
              string_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              parent_thread: 1,
              parent_post: 3,
              parent_comment: null,
              author: 1,
              created: "2020-05-23T05:52:00",
              content: '[{"insert":"friends!!!!!"}]',
              image_reference_id: null,
              is_deleted: false,
              anonymity_type: "strangers",
            },
          ],
        },
      ],
    });
  });
});
