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

  constructor({
    name,
    statusCode,
    isOperational,
    description,
  }: {
    name: string;
    statusCode: HttpStatusCode;
    description: string;
    isOperational: boolean;
  }) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

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
  }: {
    name: string;
    description: string;
    statusCode: HttpStatusCode;
    isOperational?: boolean;
  }) {
    super({ name, statusCode, isOperational, description });
  }
}

export class Unauthorized403Error extends ApiError {
  constructor(description: string) {
    super({
      name: "UNAUTHORIZED_USER",
      statusCode: HttpStatusCode.UNAUTHORIZED,
      description,
    });
  }
}

export class NotFound404Error extends ApiError {
  constructor(description: string) {
    super({
      name: "NOT_FOUND",
      statusCode: HttpStatusCode.NOT_FOUND,
      description,
    });
  }
}
