import { NextFunction, Request, Response } from "express";

import { ApiError } from "handlers/api-errors/codes";
import { ZodError } from "zod";
import debug from "debug";

const log = debug("bobaserver:handlers:errors");

// Sends the correct status code and message to the client if the error is an instance of APIError,
// else it lets the error bubble up to the global error handler.
export const handleApiErrors = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log(err);
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    const message = `Invalid schema: [${err.issues
      .map((e) => `"${e.code} (${e.path.join("/")}): ${e.message}"`)
      .join(", ")}]`;
    log("Sending back ZodError (500):", message);
    res.status(500).json({
      message,
    });
  }

  next(err);
};
