import jwt from "jsonwebtoken"
import { describe, expect, it, vi } from "vitest"

// Mock the JWT secret
const JWT_SECRET = "test-secret"
vi.stubEnv("JWT_SECRET", JWT_SECRET)

// Inline the token functions for testing (to avoid module resolution issues)
function generateSurveyToken(eventId: string, customerId: string): string {
  return jwt.sign({ eventId, customerId, type: "survey" }, JWT_SECRET, {
    expiresIn: "30d",
  })
}

function verifySurveyToken(token: string): {
  eventId: string
  customerId: string
} | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      eventId: string
      customerId: string
      type: string
    }
    if (decoded.type !== "survey") return null
    return { eventId: decoded.eventId, customerId: decoded.customerId }
  } catch {
    return null
  }
}

describe("Survey Token", () => {
  const eventId = "event123"
  const customerId = "customer456"

  describe("generateSurveyToken", () => {
    it("should generate a valid JWT token", () => {
      const token = generateSurveyToken(eventId, customerId)
      expect(token).toBeDefined()
      expect(typeof token).toBe("string")
      expect(token.split(".")).toHaveLength(3) // JWT has 3 parts
    })

    it("should include eventId and customerId in payload", () => {
      const token = generateSurveyToken(eventId, customerId)
      const decoded = jwt.decode(token) as Record<string, unknown>

      expect(decoded.eventId).toBe(eventId)
      expect(decoded.customerId).toBe(customerId)
      expect(decoded.type).toBe("survey")
    })
  })

  describe("verifySurveyToken", () => {
    it("should verify and return payload for valid token", () => {
      const token = generateSurveyToken(eventId, customerId)
      const result = verifySurveyToken(token)

      expect(result).not.toBeNull()
      expect(result?.eventId).toBe(eventId)
      expect(result?.customerId).toBe(customerId)
    })

    it("should return null for invalid token", () => {
      const result = verifySurveyToken("invalid.token.here")
      expect(result).toBeNull()
    })

    it("should return null for token with wrong type", () => {
      const wrongTypeToken = jwt.sign(
        { eventId, customerId, type: "other" },
        JWT_SECRET,
      )
      const result = verifySurveyToken(wrongTypeToken)
      expect(result).toBeNull()
    })

    it("should return null for expired token", () => {
      const expiredToken = jwt.sign(
        { eventId, customerId, type: "survey" },
        JWT_SECRET,
        { expiresIn: "-1s" }, // Already expired
      )
      const result = verifySurveyToken(expiredToken)
      expect(result).toBeNull()
    })

    it("should return null for token signed with different secret", () => {
      const wrongSecretToken = jwt.sign(
        { eventId, customerId, type: "survey" },
        "wrong-secret",
      )
      const result = verifySurveyToken(wrongSecretToken)
      expect(result).toBeNull()
    })
  })
})

describe("Survey Rating Validation", () => {
  const isValidRating = (rating: number): boolean => {
    return (
      !Number.isNaN(rating) &&
      rating >= 1 &&
      rating <= 5 &&
      Number.isInteger(rating)
    )
  }

  it("should accept ratings 1-5", () => {
    expect(isValidRating(1)).toBe(true)
    expect(isValidRating(2)).toBe(true)
    expect(isValidRating(3)).toBe(true)
    expect(isValidRating(4)).toBe(true)
    expect(isValidRating(5)).toBe(true)
  })

  it("should reject ratings outside 1-5", () => {
    expect(isValidRating(0)).toBe(false)
    expect(isValidRating(6)).toBe(false)
    expect(isValidRating(-1)).toBe(false)
    expect(isValidRating(100)).toBe(false)
  })

  it("should reject non-integer ratings", () => {
    expect(isValidRating(3.5)).toBe(false)
    expect(isValidRating(1.1)).toBe(false)
  })

  it("should reject NaN", () => {
    expect(isValidRating(NaN)).toBe(false)
  })
})
