import {
  AuthenticationError,
  DBConnectionError,
  ResourceNotFoundError,
} from "../errors";
import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const { message } = err;
  if (err instanceof AuthenticationError) {
    return res.status(401).json({ message });
  }
  if (err instanceof DBConnectionError) {
    return res.status(400).json({ message });
  }
  if (err instanceof ResourceNotFoundError) {
    return res.status(404).json({ message });
  }
  return res.status(503).json({ message });
};
