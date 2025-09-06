const original = await vi.importActual<typeof import("../auth.ts")>(
  "../auth.ts"
);

export const ensureLoggedIn = vi
  .fn()
  .mockImplementation(original.ensureLoggedIn);
export const withLoggedIn = vi.fn().mockImplementation(original.withLoggedIn);
export const withUserSettings = vi
  .fn()
  .mockImplementation(original.withUserSettings);

beforeEach(() => {
  ensureLoggedIn.mockImplementation(original.ensureLoggedIn);
  withLoggedIn.mockImplementation(original.withLoggedIn);
  withUserSettings.mockImplementation(original.withUserSettings);
});
afterEach(function () {
  ensureLoggedIn.mockRestore();
  withLoggedIn.mockRestore();
  withUserSettings.mockRestore();
});
