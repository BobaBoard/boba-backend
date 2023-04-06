import {
  BOBATAN_USER_ID,
  JERSEY_DEVIL_USER_ID,
  ONCEST_USER_ID,
  ZODIAC_KILLER_USER_ID,
} from "test/data/auth";
import { CROWN_ACCESSORY_EXTERNAL_ID, GOREMASTER_ROLE_EXTERNAL_ID, MEMESTER_ROLE_EXTERNAL_ID, OWNER_ROLE_EXTERNAL_ID } from "test/data/user";
import { GORE_BOARD_ID, MEMES_BOARD_ID } from "test/data/boards";
import {
  TWISTED_MINDS_REALM_EXTERNAL_ID,
  UWU_REALM_EXTERNAL_ID,
} from "test/data/realms";
import {
  getAllUserRoles,
  getUserFromFirebaseId,
  getUserRolesByBoard,
  getUserRolesByRealm,
} from "../queries";

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

  test("returns all the roles a user has across realms and boards - user with realm role but no board roles", async () => {
    const roles = await getAllUserRoles({ firebaseId: ZODIAC_KILLER_USER_ID });
    expect(roles).toEqual([
      {
        avatar_reference_id:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F2df7dfb4-4c64-4370-8e74-9ee30948f05d?alt=media&token=26b16bef-0fd2-47b5-b6df-6cf2799010ca",
        color: "pink",
        description: "A role for the owner.",
        id: "3",
        name: "The Owner",
        permissions:
          "{edit_board_details,post_as_role,move_thread,create_realm_invite}",
        string_id: OWNER_ROLE_EXTERNAL_ID,
        realm_ids: [UWU_REALM_EXTERNAL_ID],
        board_ids: [],
        accessory_external_id: "9e593709-419f-4b2c-b7ee-88ed47884c3c",
      },
    ]);
  });

  test("returns all the roles a user has across realms and boards - user with board role", async () => {
    const roles = await getAllUserRoles({ firebaseId: ONCEST_USER_ID });
    expect(roles).toEqual([
      {
        avatar_reference_id:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
        color: "red",
        description: "A role for people who can edit the gore board.",
        id: "1",
        name: "GoreMaster5000",
        permissions:
          "{edit_board_details,post_as_role,edit_category_tags,edit_content_notices}",
        string_id: GOREMASTER_ROLE_EXTERNAL_ID,
        realm_ids: [TWISTED_MINDS_REALM_EXTERNAL_ID],
        board_ids: [GORE_BOARD_ID],
        accessory_external_id: null,
      },
    ]);
  });

  test("returns all the roles a user has across realms and boards - user with realm role and board role", async () => {
    const roles = await getAllUserRoles({ firebaseId: BOBATAN_USER_ID });
    expect(roles).toEqual([
      {
        id: "1",
        string_id: GOREMASTER_ROLE_EXTERNAL_ID,
        name: "GoreMaster5000",
        avatar_reference_id:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
        color: "red",
        description: "A role for people who can edit the gore board.",
        permissions:
          "{edit_board_details,post_as_role,edit_category_tags,edit_content_notices}",
        realm_ids: [TWISTED_MINDS_REALM_EXTERNAL_ID],
        board_ids: [GORE_BOARD_ID],
        accessory_external_id: null,
      },
      {
        id: "2",
        string_id: MEMESTER_ROLE_EXTERNAL_ID,
        name: "The Memester",
        avatar_reference_id:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F01af97fa-e240-4002-81fb-7abec9ee984b?alt=media&token=ac14effe-a788-47ae-b3b8-cbb3d8ad8f94",
        color: "blue",
        description: "A role for the real memers.",
        permissions: "{all}",
        realm_ids: [UWU_REALM_EXTERNAL_ID],
        board_ids: [MEMES_BOARD_ID],
        accessory_external_id: null,
      },
      {
        id: "3",
        string_id: OWNER_ROLE_EXTERNAL_ID,
        name: "The Owner",
        avatar_reference_id:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F2df7dfb4-4c64-4370-8e74-9ee30948f05d?alt=media&token=26b16bef-0fd2-47b5-b6df-6cf2799010ca",
        color: "pink",
        description: "A role for the owner.",
        permissions:
          "{edit_board_details,post_as_role,move_thread,create_realm_invite}",
        realm_ids: [TWISTED_MINDS_REALM_EXTERNAL_ID],
        board_ids: [],
        accessory_external_id: CROWN_ACCESSORY_EXTERNAL_ID,
      },
    ]);
  });

  test("returns an empty array if user has no roles", async () => {
    const roles = await getAllUserRoles({ firebaseId: JERSEY_DEVIL_USER_ID });
    expect(roles).toEqual([]);
  });

  test.todo(
    "lists multiple boards where a user has the same role, if applicable (no examples in test data yet)"
  );
  test.todo(
    "lists multiple realms where a user has the same role, if applicable (no examples in test data yet)"
  );

  test("returns an empty array if the user has no roles in the current realm", async () => {
    const roles = await getUserRolesByRealm({
      firebaseId: JERSEY_DEVIL_USER_ID,
      realmId: TWISTED_MINDS_REALM_EXTERNAL_ID,
    });
    expect(roles).toEqual([]);
  });

  test("returns all the roles a user has in the current realm", async () => {
    const roles = await getUserRolesByRealm({
      firebaseId: ZODIAC_KILLER_USER_ID,
      realmId: UWU_REALM_EXTERNAL_ID,
    });
    expect(roles).toEqual([
      {
        avatar_reference_id:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F2df7dfb4-4c64-4370-8e74-9ee30948f05d?alt=media&token=26b16bef-0fd2-47b5-b6df-6cf2799010ca",
        color: "pink",
        description: "A role for the owner.",
        id: "3",
        name: "The Owner",
        permissions:
          "{edit_board_details,post_as_role,move_thread,create_realm_invite}",
        string_id: "3df1d417-c36a-43dd-aaba-9590316ffc32",
      },
    ]);
  });

  test("returns all the roles a user has for a given board", async () => {
    const roles = await getUserRolesByBoard({
      firebaseId: BOBATAN_USER_ID,
      boardId: GORE_BOARD_ID,
    });

    expect(roles).toEqual([
      {
        avatar_reference_id:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
        color: "red",
        description: "A role for people who can edit the gore board.",
        id: "1",
        name: "GoreMaster5000",
        permissions:
          "{edit_board_details,post_as_role,edit_category_tags,edit_content_notices}",
        string_id: "e5f86f53-6dcd-4f15-b6ea-6ca1f088e62d",
      },
    ]);
  });
});
