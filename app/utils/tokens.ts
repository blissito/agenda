import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-me";

export const generateUserToken = (email: string): string => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
};

export const validateUserToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      isValid: true,
      decoded,
      expired: false,
    };
  } catch (e: unknown) {
    const error = e as Error & { name?: string };
    const isExpired = error.name === "TokenExpiredError";
    return {
      isValid: false,
      expired: isExpired,
      error,
      errorMessage: isExpired ? "El link ha expirado" : error.message,
    };
  }
};
