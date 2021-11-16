import {
  BoardPermissions,
  DbRolePermissions,
  PostPermissions,
  ThreadPermissions,
  UserBoardPermissions,
} from "types/permissions";
import {
  extractBoardPermissions,
  extractPostPermissions,
  extractThreadPermissions,
  hasPermission,
} from "utils/permissions-utils";

describe("hasPermission tests", () => {
  test("correctly identifies permission existing", () => {
    expect(
      hasPermission(DbRolePermissions.edit_content, [
        DbRolePermissions.edit_board_details,
        DbRolePermissions.edit_content_notices,
        DbRolePermissions.edit_content,
      ])
    ).toBeTrue();
  });

  test("correctly identifies permission existing with all", () => {
    expect(
      hasPermission(DbRolePermissions.edit_content, [DbRolePermissions.all])
    ).toBeTrue();
  });

  test("correctly identifies permission missing", () => {
    expect(
      hasPermission(DbRolePermissions.edit_content, [
        DbRolePermissions.edit_board_details,
        DbRolePermissions.edit_content_notices,
      ])
    ).toBeFalse();
  });
});

describe("extractPostPermissions tests", () => {
  test("correctly transforms all existing permissions", () => {
    const permissions = extractPostPermissions(
      Object.values(DbRolePermissions)
    );
    const expected = [...Object.values(PostPermissions)];
    expect(permissions.sort()).toEqual(expected.sort());
  });

  test("correctly ignores non-existing permissions", () => {
    const permissions = extractPostPermissions([
      DbRolePermissions.edit_board_details,
      DbRolePermissions.edit_index_tags,
    ]);
    const expected = [PostPermissions.editIndexTags];
    expect(permissions.sort()).toEqual(expected.sort());
  });
});

describe("extractThreadPermissions tests", () => {
  test("correctly transforms all existing permissions", () => {
    const permissions = extractThreadPermissions(
      Object.values(DbRolePermissions)
    );
    const expected = [...Object.values(ThreadPermissions)];
    expect(permissions.sort()).toEqual(expected.sort());
  });

  test("correctly ignores non-existing permissions", () => {
    const permissions = extractThreadPermissions([
      DbRolePermissions.edit_board_details,
      DbRolePermissions.move_thread,
    ]);
    const expected = [ThreadPermissions.moveThread];
    expect(permissions.sort()).toEqual(expected.sort());
  });
});

describe("extractBoardPermissions tests", () => {
  test("correctly transforms all existing permissions", () => {
    const permissions = extractBoardPermissions(
      Object.values(DbRolePermissions)
    );
    const expected = [...Object.values(BoardPermissions)];
    expect(permissions.sort()).toEqual(expected.sort());
  });

  test("correctly ignores non-existing permissions", () => {
    const permissions = extractBoardPermissions([
      DbRolePermissions.edit_board_details,
      DbRolePermissions.edit_index_tags,
    ]);
    const expected = [BoardPermissions.editMetadata];
    expect(permissions.sort()).toEqual(expected.sort());
  });
});
