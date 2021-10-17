import { getBoardBySlug, getBoards } from "../queries";

const extractRestrictions = (board: any) => {
  return {
    logged_in_base_restrictions: board.logged_in_base_restrictions,
    logged_out_restrictions: board.logged_out_restrictions,
  };
};

describe("Tests restricted board queries", () => {
  test("board fetch contains lock access restriction for logged out users", async () => {
    const board = await getBoardBySlug({
      slug: "restricted",
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
