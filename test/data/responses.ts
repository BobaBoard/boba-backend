import { GenericResponse } from "../../types/rest/responses";

export const ENSURE_LOGGED_IN_NO_TOKEN: GenericResponse = {
  message: "No authenticated user found.",
};

export const ENSURE_LOGGED_IN_INVALID_TOKEN: GenericResponse = {
  message: "Authentication token expired.",
};

export const ENSURE_THREAD_ACCESS_UNAUTHENTICATED: GenericResponse = {
  message: "User must be authenticated to access thread.",
};

export const ENSURE_THREAD_ACCESS_UNAUTHORIZED: GenericResponse = {
  message: "User does not have required permissions to access thread.",
};

export const ENSURE_THREAD_PERMISSIONS_UNAUTHORIZED: GenericResponse = {
  message: "User does not have required permissions for thread operation.",
};

export const ENSURE_BOARD_ACCESS_UNAUTHENTICATED: GenericResponse = {
  message: "User must be authenticated to access board.",
};

export const ENSURE_BOARD_ACCESS_UNAUTHORIZED: GenericResponse = {
  message: "User does not have required permissions to access board.",
};

export const ENSURE_BOARD_PERMISSIONS_UNAUTHORIZED: GenericResponse = {
  message: "User does not have required permissions for board operation.",
};

export const ENSURE_REALM_PERMISSIONS_UNAUTHORIZED: GenericResponse = {
  message: "User does not have required permissions for realm operation.",
};
