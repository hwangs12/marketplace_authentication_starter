export class ResourceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResourceNotFoundError";

    Object.setPrototypeOf(this, ResourceNotFoundError.prototype);
  }
}
