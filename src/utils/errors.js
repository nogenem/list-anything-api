import forEach from "lodash.foreach";

export class CustomError extends Error {
  constructor(msgObj, status = 400, ...params) {
    super(JSON.stringify(msgObj, null, 2), ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    this.msgObj = msgObj;
    this.kind = "CustomError";
    this.status = status;
  }
}

export const invalidIdError = () => new CustomError({ global: "Invalid id" });

export const duplicatedValuesError = fields => {
  const msgObj = {};
  forEach(fields, field => {
    msgObj[field] = "Can't have duplicates";
  });
  return new CustomError(msgObj);
};

export const invalidRequestError = () =>
  new CustomError({ global: "Invalid request" });

export const invalidCredentialsError = () =>
  new CustomError({ global: "Invalid credentials" });

export const noUserWithSuchEmailError = () =>
  new CustomError({ global: "There is no user with such email" });

export const invalidTokenError = () =>
  new CustomError({ global: "Invalid token" });

export const noTokenError = () => new CustomError({ global: "No token" });
