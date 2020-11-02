import "mocha";
import { expect } from "chai";

import { getUserFromFirebaseId } from "../queries";

describe("Test users query", () => {
  it("gets user from id", async () => {
    const user = await getUserFromFirebaseId({ firebaseId: "fb2" });

    expect(user).to.eql({
      avatar_reference_id: "hannibal.png",
      created_on: null,
      firebase_id: "fb2",
      id: "2",
      invited_by: "1",
      username: "jersey_devil_69",
    });
  });
});
