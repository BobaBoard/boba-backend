import { JERSEY_DEVIL_USER_ID } from "test/data/auth";
import { getUserFromFirebaseId } from "../queries";

describe("Tests user queries", () => {
  test("gets user from id", async () => {
    const user = await getUserFromFirebaseId({
      firebaseId: JERSEY_DEVIL_USER_ID,
    });

    expect(user).toEqual({
      avatar_reference_id: "hannibal.png",
      created_on: null,
      firebase_id: JERSEY_DEVIL_USER_ID,
      id: "2",
      invited_by: "1",
      username: "jersey_devil_69",
    });
  });
});
