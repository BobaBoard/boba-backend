import { type NextFunction, type Request, type Response } from "express";

import { ApiError } from "./codes.js";
import { ZodError } from "zod";
import debug from "debug";
import opentelemetry from "@opentelemetry/api";

const log = debug("bobaserver:handlers:errors-log");

// Sends the correct status code and message to the client if the error is an instance of APIError,
// else it lets the error bubble up to the global error handler.
export const handleApiErrors = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const activeSpan = opentelemetry.trace.getActiveSpan();
  if ("cause" in err) {
    activeSpan?.recordException(err.cause as Error);
    log(`Error cause:`, err.cause);
  }
  activeSpan?.recordException(err);
  log(`Error:`, err);
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
