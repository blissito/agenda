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
    };
  } catch (e: any) {
    console.error(e);
    return {
      isValid: false,
      error: e,
      errorMessage: e.message,
    };
  }
};
