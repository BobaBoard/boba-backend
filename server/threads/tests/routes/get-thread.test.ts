import {
  CHARACTER_TO_MAIM_POST,
  KERMIT_COMMENTS,
  KERMIT_POST,
  REVOLVER_OCELOT_POST,
} from "test/data/posts";

import { GORE_BOARD_ID } from "test/data/boards";
import { Thread } from "types/rest/threads";
import request from "supertest";
import router from "../../routes";
import { startTestServer } from "utils/test-utils";

describe("Tests threads REST API", () => {
  const server = startTestServer(router);

  test("should return threads data (logged out)", async () => {
    const res = await request(server.app).get(
      "/29d1b2da-3289-454a-9089-2ed47db4967b"
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual<Thread>({
      id: "29d1b2da-3289-454a-9089-2ed47db4967b",
      parent_board_slug: "gore",
      parent_board_id: GORE_BOARD_ID,
      default_view: "thread",
      hidden: false,
      muted: false,
      starter: CHARACTER_TO_MAIM_POST,
      posts: [CHARACTER_TO_MAIM_POST, REVOLVER_OCELOT_POST, KERMIT_POST],
      comments: {
        [CHARACTER_TO_MAIM_POST.id]: [],
        [REVOLVER_OCELOT_POST.id]: [],
        [KERMIT_POST.id]: KERMIT_COMMENTS,
      },
      new: false,
      last_activity_at: KERMIT_COMMENTS[1].created_at,
      new_comments_amount: 0,
      total_posts_amount: 3,
      new_posts_amount: 0,
      total_comments_amount: 2,
      direct_threads_amount: 2,
    });
  });
});
