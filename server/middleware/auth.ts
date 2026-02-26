import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

// Extend the Express Request type to include our user payload
export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // 1. Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "AUTHENTICATION_REQUIRED",
      message: "Please log in to perform this action.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Verify and extract the payload (matches your jwt.sign key)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // 3. Attach to request object
    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (error) {
    // 4. Handle expired or tampered tokens
    return res.status(403).json({
      error: "INVALID_SESSION",
      message: "Your session has expired. Please log in again.",
    });
  }
};
