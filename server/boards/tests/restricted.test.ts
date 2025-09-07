import { getBoardByExternalId, getRealmBoards } from "../queries.js";

import { RESTRICTED_BOARD_ID } from "test/data/boards.js";
import {
  type BoardByExternalId,
  type DbRealmBoardType,
} from "server/boards/sql/types.js";

const extractRestrictions = (board: BoardByExternalId | DbRealmBoardType) => {
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

    expect(extractRestrictions(board!)).toEqual({
      logged_in_base_restrictions: [],
      logged_out_restrictions: ["lock_access"],
    });
  });

  test("board fetch contains lock access restriction for logged out users", async () => {
    const boards = await getRealmBoards({
      firebaseId: "fb3",
    });

    expect(
      extractRestrictions(boards.find((board) => board.slug == "restricted")!)
    ).toEqual({
      logged_in_base_restrictions: [],
      logged_out_restrictions: ["lock_access"],
    });
  });
});
