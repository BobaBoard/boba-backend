import { LONG_BOARD_ID } from "test/data/boards.js";
import { decodeCursor, encodeCursor } from "utils/queries-utils.js";

import type { ThreadSummary } from "types/rest/threads.js";
import request from "supertest";
import router from "../../routes.js";
import { startTestServer } from "utils/test-utils.js";

describe("Tests boards REST API", () => {
  const server = startTestServer(router);

  test("should return activity data for filter", async () => {
    const res = await request(server.app)
      .get(`/boards/${LONG_BOARD_ID}`)
      .query({
        categoryFilter: "odd",
      });

    expect(res.status).toBe(200);
    expect(decodeCursor(res.body.cursor.next)).toEqual({
      last_activity_cursor: "2020-04-04T05:42:00.000000",
      page_size: 10,
    });
    expect(
      res.body.activity.map((thread: ThreadSummary) => thread.starter.content)
    ).toEqual([
      '[{"insert":"Post 25!"}]',
      '[{"insert":"Post 23!"}]',
      '[{"insert":"Post 21 (with microseconds)!"}]',
      '[{"insert":"Post 19!"}]',
      '[{"insert":"Post 17!"}]',
      '[{"insert":"Post 15!"}]',
      '[{"insert":"Post 13!"}]',
      '[{"insert":"Post 11!"}]',
      '[{"insert":"Post 9!"}]',
      '[{"insert":"Post 7!"}]',
    ]);
  });

  test("should return next page of activity data for filter", async () => {
    const res = await request(server.app)
      .get(`/boards/${LONG_BOARD_ID}`)
      .query({
        categoryFilter: "odd",
        cursor: encodeCursor({
          last_activity_cursor: "2020-04-04T05:42:00.000000",
          page_size: 10,
        }),
      });

    expect(res.status).toBe(200);
    expect(res.body.cursor.next).toBeNull();
    expect(
      res.body.activity.map((thread: ThreadSummary) => thread.starter.content)
    ).toEqual([
      '[{"insert":"Post 5!"}]',
      '[{"insert":"Post 3!"}]',
      '[{"insert":"Post 1!"}]',
    ]);
  });
});
