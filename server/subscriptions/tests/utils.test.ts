import "mocha";
import sinon from "sinon";
import axios from "axios";
import { expect } from "chai";

import { maybeUpdateSubscriptionsOnThreadChange } from "../utils";

import debug from "debug";
const log = debug("bobaserver:test:subscriptions:utils-log");

const axiosStub = sinon.stub(axios, "post");

describe("Tests subscriptions updates", function () {
  afterEach(function () {
    axiosStub.restore();
  });
  it("correctly triggers webhook on thread update", async function () {
    await maybeUpdateSubscriptionsOnThreadChange({
      threadId: "2765f36a-b4f9-4efe-96f2-cb34f055d032",
      postId: "this_is_a_test_post",
      boardSlug: "memes",
      secretIdentity: { name: "webmaster", avatar: "webmaster_url" },
      categoryNames: ["aiba"],
    });

    sinon.assert.calledWithMatch(
      axiosStub,
      "http://localhost:4200/hooks/aiba",
      {
        avatar_url: "webmaster_url",
        content: `Your "aiba!" subscription has updated!\nhttps://v0.boba.social/!memes/thread/2765f36a-b4f9-4efe-96f2-cb34f055d032/this_is_a_test_post`,
        username: "webmaster",
      }
    );
  });
});
