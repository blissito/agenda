import jwt from "jsonwebtoken";

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
