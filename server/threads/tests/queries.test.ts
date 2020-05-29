import "mocha";
import { expect } from "chai";

import { getThreadByStringId, getThreadIdentitiesByStringId } from "../queries";

describe("Tests threads queries", () => {
  it("fetches threads by string id (with comments)", async () => {
    const thread = await getThreadByStringId(
      "29d1b2da-3289-454a-9089-2ed47db4967b"
    );

    expect(thread).to.eql({
      id: "1",
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
          anonymity_type: "strangers",
          author: 1,
          comments: null,
          content: '[{"insert":"Revolver Ocelot"}]',
          created: "2020-05-01T05:42:00",
          id: 2,
          is_deleted: false,
          parent_thread: 1,
          parent_post: 1,
          string_id: "619adf62-833f-4bea-b591-03e807338a8e",
          type: "text",
          whisper_tags: ["fight me on this"],
        },
        {
          content: '[{"insert":"Kermit the Frog"}]',
          created: "2020-05-02T06:04:00",
          id: 3,
          is_deleted: false,
          parent_thread: 1,
          parent_post: 1,
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
              created: "2020-04-30T00:22:00",
              id: 1,
              image_reference_id: null,
              is_deleted: false,
              parent_comment: null,
              parent_post: 3,
              parent_thread: 1,
              string_id: "46a16199-33d1-48c2-bb79-4d4095014688",
            },
            {
              anonymity_type: "strangers",
              author: 1,
              content: '[{"insert":"friends!!!!!"}]',
              created: "2020-05-23T05:52:00",
              id: 2,
              image_reference_id: null,
              is_deleted: false,
              parent_comment: null,
              parent_post: 3,
              parent_thread: 1,
              string_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
            },
          ],
        },
      ],
      string_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
    });
  });

  it("fetches threads by string id (no comments)", async () => {
    const thread = await getThreadByStringId(
      "a5c903df-35e8-43b2-a41a-208c43154671"
    );
    expect(thread).to.eql({
      id: "2",
      parent_board: "2",
      string_id: "a5c903df-35e8-43b2-a41a-208c43154671",
      posts: [
        {
          id: 4,
          string_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          parent_thread: 2,
          parent_post: null,
          author: 1,
          created: "2020-04-24T05:42:00",
          content: '[{"insert":"Favorite murder scene in videogames?"}]',
          type: "text",
          whisper_tags: ["mwehehehehe"],
          is_deleted: false,
          anonymity_type: "strangers",
          comments: null,
        },
        {
          anonymity_type: "strangers",
          author: 3,
          comments: null,
          content: '[{"insert":"Everything in The Evil Within tbh"}]',
          created: "2020-04-30T08:22:00",
          id: 5,
          is_deleted: false,
          parent_thread: 2,
          parent_post: 4,
          string_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
          type: "text",
          whisper_tags: ["joseph oda is love", "joseph oda is life"],
        },
        {
          anonymity_type: "strangers",
          author: 2,
          comments: null,
          content:
            '[{"insert":"(chants) Leon Kennedy! Leon Kennedy! Leon Kennedy!)"}]',
          created: "2020-04-30T09:47:00",
          id: 6,
          is_deleted: false,
          parent_thread: 2,
          parent_post: 4,
          string_id: "1f1ad4fa-f02a-48c0-a78a-51221a7db170",
          type: "text",
          whisper_tags: [
            "nothing beats a himbo getting gangbanged by a herd of hungry hungry zombies",
          ],
        },
      ],
    });
  });

  it("returns null thread when id not found", async () => {
    const thread = await getThreadByStringId("this_will_not_be_in_the_db");

    expect(thread).to.be.null;
  });

  it("fetches thread identities by string id", async () => {
    const identities = await getThreadIdentitiesByStringId(
      "29d1b2da-3289-454a-9089-2ed47db4967b"
    );
    expect(identities.length).to.eql(2);
    expect(identities[0]).to.eql({
      display_name: "Sunglasses Raccoon",
      id: "1",
      secret_identity_avatar_reference_id: null,
      user_avatar_reference_id: null,
      username: "bobatan",
    });
    expect(identities[1]).to.eql({
      display_name: "Evil Moth",
      id: "3",
      secret_identity_avatar_reference_id: null,
      user_avatar_reference_id: null,
      username: "oncest5evah",
    });
  });

  it("return null for thread identities when thread not found", async () => {
    const thread = await getThreadIdentitiesByStringId(
      "this_will_not_be_in_the_db"
    );

    expect(thread).to.be.null;
  });
});
