import jwt, {
  TokenExpiredError,
  type JsonWebTokenError,
  type JwtPayload,
} from "jsonwebtoken";
import { db } from "./db.server";

export const generateUserToken = (email: string): string => {
  return jwt.sign({ email }, "denik.me", { expiresIn: "1h" });
};

export const validateUserToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, "denik.me");
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

export const getTokenIfUserOrNull = async (email: string) => {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return null;
  return generateUserToken(user.email);
};
