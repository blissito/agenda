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

// Event action tokens for email links
export type EventAction = "confirm" | "modify" | "cancel";

export interface EventActionPayload {
  eventId: string;
  customerId: string;
  action: EventAction;
}

/**
 * Generate a JWT token for event actions (confirm, modify, cancel)
 * Token expires in 7 days
 */
export function generateEventActionToken(payload: EventActionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verify and decode an event action token
 * Returns the payload if valid, null if invalid or expired
 */
export function verifyEventActionToken(
  token: string
): EventActionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as EventActionPayload;
    return decoded;
  } catch {
    return null;
  }
}
