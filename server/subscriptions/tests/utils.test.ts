import { CacheKeys, cache } from "../../cache";

import axios from "axios";
import { maybeUpdateSubscriptionsOnThreadChange } from "../utils";
import { mocked } from "jest-mock";

jest.mock("server/cache");
jest.mock("axios");

describe("Tests subscriptions updates", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("correctly triggers webhook on thread update", async function () {
    mocked(axios.post).mockReturnValueOnce(Promise.resolve());
    await maybeUpdateSubscriptionsOnThreadChange({
      threadId: "2765f36a-b4f9-4efe-96f2-cb34f055d032",
      postId: "this_is_a_test_post",
      boardSlug: "memes",
      secretIdentity: {
        name: "webmaster",
        avatar: "webmaster_url",
        color: "purple",
        accessory: "accessory_url.png",
      },
      categoryNames: ["aiba"],
    });

    expect(cache().hdel).toHaveBeenCalledWith(
      CacheKeys.SUBSCRIPTION,
      "a87800a6-21e5-46dd-a979-a901cdcea563"
    );
    expect(axios.post).toBeCalledWith("http://localhost:4200/hooks/aiba", {
      avatar_url: "webmaster_url",
      content: `Your "aiba!" subscription has updated!\nhttps://v0.boba.social/!memes/thread/2765f36a-b4f9-4efe-96f2-cb34f055d032/this_is_a_test_post`,
      username: "webmaster",
    });
    expect(axios.post).toBeCalledTimes(1);
  });
});
