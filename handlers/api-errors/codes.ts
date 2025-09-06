export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  UNAUTHORIZED = 403,
  INTERNAL_SERVER = 500,
}

class BaseError extends Error {
  public readonly name: string;
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly cause: Error | undefined;

  constructor({
    name,
    statusCode,
    isOperational,
    description,
    cause,
  }: {
    name: string;
    statusCode: HttpStatusCode;
    description: string;
    isOperational: boolean;
    cause: Error | undefined;
  }) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.cause = cause;

    // TODO: figure out if this is needed and why it's not working.
    // Error.captureStackTrace(this);
  }
}

export class ApiError extends BaseError {
  constructor({
    name,
    statusCode = HttpStatusCode.INTERNAL_SERVER,
    isOperational = true,
    description = "internal server error",
    cause,
  }: {
    name: string;
    description: string;
    statusCode: HttpStatusCode;
    isOperational?: boolean;
    cause: Error | undefined;
  }) {
    super({ name, statusCode, isOperational, description, cause });
  }
}
export class Internal500Error extends ApiError {
  constructor(description: string, options?: { cause?: Error }) {
    super({
      name: "INTERNAL_SERVER_ERROR",
      statusCode: HttpStatusCode.INTERNAL_SERVER,
      description,
      cause: options?.cause,
    });
  }
}

export class Forbidden403Error extends ApiError {
  constructor(description: string, options?: { cause?: Error }) {
    super({
      name: "UNAUTHORIZED_USER",
      statusCode: HttpStatusCode.UNAUTHORIZED,
      description,
      cause: options?.cause,
    });
  }
}

export class BadRequest400Error extends ApiError {
  constructor(description: string, options?: { cause?: Error }) {
    super({
      name: "BAD_REQUEST",
      statusCode: HttpStatusCode.BAD_REQUEST,
      description,
      cause: options?.cause,
    });
  }
}

export class NotFound404Error extends ApiError {
  constructor(description: string, options?: { cause?: Error }) {
    super({
      name: "NOT_FOUND",
      statusCode: HttpStatusCode.NOT_FOUND,
      description,
      cause: options?.cause,
    });
  }
}
