import { getBoardByExternalId, getBoards } from "../queries";

import { RESTRICTED_BOARD_ID } from "test/data/boards";

const extractRestrictions = (board: any) => {
  return {
    logged_in_base_restrictions: board.logged_in_base_restrictions,
    logged_out_restrictions: board.logged_out_restrictions,
  };
};

describe("Tests restricted board queries", () => {
  test("board fetch contains lock access restriction for logged out users", async () => {
    const board = await getBoardByExternalId({
      boardExternalId: RESTRICTED_BOARD_ID,
      // Oncest
      firebaseId: "fb3",
    });

    expect(extractRestrictions(board)).toEqual({
      logged_in_base_restrictions: [],
      logged_out_restrictions: ["lock_access"],
    });
  });

  test("board fetch contains lock access restriction for logged out users", async () => {
    const boards = await getBoards({
      firebaseId: "fb3",
    });

    expect(
      extractRestrictions(
        boards.find((board: any) => board.slug == "restricted")
      )
    ).toEqual({
      logged_in_base_restrictions: [],
      logged_out_restrictions: ["lock_access"],
    });
  });
});
