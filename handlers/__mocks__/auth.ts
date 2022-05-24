const original = jest.requireActual("../auth.ts");

export const ensureLoggedIn = jest.fn(original.ensureLoggedIn);
export const withLoggedIn = jest.fn(original.withLoggedIn);
export const withUserSettings = jest.fn(original.withUserSettings);
export const withFirebaseUserData = jest.fn(original.withFirebaseUserData);

beforeEach(() => {
  ensureLoggedIn.mockImplementation(original.ensureLoggedIn);
  withLoggedIn.mockImplementation(original.withLoggedIn);
  withUserSettings.mockImplementation(original.withUserSettings);
  withFirebaseUserData.mockImplementation(original.withFirebaseUserData);
});
afterEach(function () {
  ensureLoggedIn.mockRestore();
  withLoggedIn.mockRestore();
  withUserSettings.mockRestore();
  withFirebaseUserData.mockRestore();
});
