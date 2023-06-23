export class DBConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DBConnectionError";

    Object.setPrototypeOf(this, DBConnectionError.prototype);
  }
}
