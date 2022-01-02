import {
  EXCELLENT_THREAD_SUMMARY,
  FAVORITE_CHARACTER_THREAD_SUMMARY,
  FAVORITE_MURDER_THREAD_SUMMARY,
} from "test/data/threads";

import { GORE_BOARD_ID } from "test/data/boards";
import debug from "debug";
import request from "supertest";
import router from "../../routes";
import { startTestServer } from "utils/test-utils";

const log = debug("bobaserver:board:routes");

describe("Tests boards REST API", () => {
  const server = startTestServer(router);

  test("should return activity data", async () => {
    const res = await request(server.app).get(`/boards/${GORE_BOARD_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      cursor: {
        next: null,
      },
      activity: [
        EXCELLENT_THREAD_SUMMARY,
        FAVORITE_CHARACTER_THREAD_SUMMARY,
        FAVORITE_MURDER_THREAD_SUMMARY,
      ],
    });
  });
});
