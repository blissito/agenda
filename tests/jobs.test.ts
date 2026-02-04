import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Email Templates", () => {
  describe("reminderTemplate", () => {
    it("should generate valid HTML with all parameters", async () => {
      const { default: reminderTemplate } = await import("~/utils/emails/reminderTemplate");

      const html = reminderTemplate({
        modifyLink: "https://example.com/modify",
        cancelLink: "https://example.com/cancel",
        serviceName: "Corte de cabello",
        dateString: "Lunes 15 de Enero, 2024 a las 10:00",
        minutes: 60,
        displayName: "Juan Pérez",
        address: "Calle Principal 123",
        orgName: "Barbería Example",
        customerName: "María García",
        hoursUntil: 4,
      });

      expect(html).toContain("María García");
      expect(html).toContain("Corte de cabello");
      expect(html).toContain("Barbería Example");
      expect(html).toContain("4 horas");
      expect(html).toContain("https://example.com/modify");
      expect(html).toContain("https://example.com/cancel");
    });

    it("should handle 1 hour remaining correctly", async () => {
      const { default: reminderTemplate } = await import("~/utils/emails/reminderTemplate");

      const html = reminderTemplate({
        modifyLink: "https://example.com/modify",
        cancelLink: "https://example.com/cancel",
        serviceName: "Test Service",
        dateString: "Test Date",
        minutes: 30,
        displayName: "Test Owner",
        address: "Test Address",
        orgName: "Test Org",
        customerName: "Test Customer",
        hoursUntil: 1,
      });

      expect(html).toContain("en 1 hora");
    });

    it("should include Deník branding", async () => {
      const { default: reminderTemplate } = await import("~/utils/emails/reminderTemplate");

      const html = reminderTemplate({
        modifyLink: "https://example.com/modify",
        cancelLink: "https://example.com/cancel",
        serviceName: "Test",
        orgName: "Test Org",
        customerName: "Test",
      });

      expect(html).toContain("Deník");
      expect(html).toContain("denik.me");
    });
  });

  describe("surveyTemplate", () => {
    it("should generate valid HTML with rating links", async () => {
      const { default: surveyTemplate } = await import("~/utils/emails/surveyTemplate");

      const html = surveyTemplate({
        serviceName: "Masaje relajante",
        orgName: "Spa Example",
        customerName: "Ana López",
        surveyLink: "https://example.com/survey?token=abc123",
      });

      expect(html).toContain("Ana López");
      expect(html).toContain("Masaje relajante");
      expect(html).toContain("Spa Example");
      // Check for rating links (1-5 stars)
      expect(html).toContain("rating=1");
      expect(html).toContain("rating=2");
      expect(html).toContain("rating=3");
      expect(html).toContain("rating=4");
      expect(html).toContain("rating=5");
    });

    it("should include emoji indicators", async () => {
      const { default: surveyTemplate } = await import("~/utils/emails/surveyTemplate");

      const html = surveyTemplate({
        serviceName: "Test",
        orgName: "Test Org",
        customerName: "Test",
        surveyLink: "https://example.com/survey",
      });

      // Check for emoji rating indicators
      expect(html).toContain("😞");
      expect(html).toContain("😕");
      expect(html).toContain("😐");
      expect(html).toContain("😊");
      expect(html).toContain("😍");
    });

    it("should include call to action button", async () => {
      const { default: surveyTemplate } = await import("~/utils/emails/surveyTemplate");

      const html = surveyTemplate({
        serviceName: "Test",
        orgName: "Test Org",
        customerName: "Test",
        surveyLink: "https://example.com/survey",
      });

      expect(html).toContain("Dejar comentario");
    });
  });

  describe("appointmentCustomerTemplate", () => {
    it("should generate confirmation email with all details", async () => {
      const { default: appointmentTemplate } = await import("~/utils/emails/appointmentCustomerTemplate");

      const html = appointmentTemplate({
        confirmLink: "https://example.com/confirm",
        modifyLink: "https://example.com/modify",
        reservationNumber: "12345",
        serviceName: "Consulta médica",
        dateString: "Martes 20 de Febrero, 2024",
        minutes: 45,
        amount: 500,
        displayName: "Dr. García",
        address: "Av. Revolución 100",
        orgName: "Clínica Example",
        customerName: "Pedro Sánchez",
      });

      expect(html).toContain("Pedro Sánchez");
      expect(html).toContain("Clínica Example");
      expect(html).toContain("Consulta médica");
      expect(html).toContain("12345");
      expect(html).toContain("$500 mxn");
      expect(html).toContain("Confirmar cita");
      expect(html).toContain("Modificar cita");
    });

    it("should show 'Gratuito' for free services", async () => {
      const { default: appointmentTemplate } = await import("~/utils/emails/appointmentCustomerTemplate");

      const html = appointmentTemplate({
        confirmLink: "https://example.com/confirm",
        modifyLink: "https://example.com/modify",
        amount: 0,
        serviceName: "Evento gratuito",
        orgName: "Test Org",
        customerName: "Test",
      });

      expect(html).toContain("Gratuito");
    });
  });
});

describe("WhatsApp Service", () => {
  it("should throw WhatsAppNotConfiguredError when not configured", async () => {
    const { sendWhatsAppMessage, WhatsAppNotConfiguredError } = await import("~/.server/whatsapp");

    const org = {
      id: "test-org",
      integrations: null,
    } as any;

    await expect(
      sendWhatsAppMessage(org, "+521234567890", "test_template", {})
    ).rejects.toThrow(WhatsAppNotConfiguredError);
  });

  it("should correctly identify unconfigured org (null integrations)", async () => {
    const { isWhatsAppConfigured } = await import("~/.server/whatsapp");

    const org = {
      id: "test-org",
      integrations: null,
    } as any;

    expect(isWhatsAppConfigured(org)).toBe(false);
  });

  it("should correctly identify unconfigured org (missing whatsapp)", async () => {
    const { isWhatsAppConfigured } = await import("~/.server/whatsapp");

    const org = {
      id: "test-org",
      integrations: {
        messenger: { pageId: "123" },
      },
    } as any;

    expect(isWhatsAppConfigured(org)).toBe(false);
  });

  it("should correctly identify unconfigured org (missing accessToken)", async () => {
    const { isWhatsAppConfigured } = await import("~/.server/whatsapp");

    const org = {
      id: "test-org",
      integrations: {
        whatsapp: {
          phoneNumberId: "123",
          accessToken: null,
        },
      },
    } as any;

    expect(isWhatsAppConfigured(org)).toBe(false);
  });

  it("should correctly identify configured org", async () => {
    const { isWhatsAppConfigured } = await import("~/.server/whatsapp");

    const org = {
      id: "test-org",
      integrations: {
        whatsapp: {
          phoneNumberId: "123456",
          accessToken: "test-token",
          businessId: "789",
          connectedAt: new Date(),
        },
      },
    } as any;

    expect(isWhatsAppConfigured(org)).toBe(true);
  });
});

describe("Messenger Service", () => {
  it("should throw MessengerNotConfiguredError when not configured", async () => {
    const { sendMessengerMessage, MessengerNotConfiguredError } = await import("~/.server/messenger");

    const org = {
      id: "test-org",
      integrations: null,
    } as any;

    await expect(
      sendMessengerMessage(org, "recipient-id", "Test message")
    ).rejects.toThrow(MessengerNotConfiguredError);
  });

  it("should correctly identify unconfigured org (null integrations)", async () => {
    const { isMessengerConfigured } = await import("~/.server/messenger");

    const org = {
      id: "test-org",
      integrations: null,
    } as any;

    expect(isMessengerConfigured(org)).toBe(false);
  });

  it("should correctly identify unconfigured org (missing pageAccessToken)", async () => {
    const { isMessengerConfigured } = await import("~/.server/messenger");

    const org = {
      id: "test-org",
      integrations: {
        messenger: {
          pageId: "123",
          pageAccessToken: null,
        },
      },
    } as any;

    expect(isMessengerConfigured(org)).toBe(false);
  });

  it("should correctly identify configured org", async () => {
    const { isMessengerConfigured } = await import("~/.server/messenger");

    const org = {
      id: "test-org",
      integrations: {
        messenger: {
          pageId: "page-123",
          pageAccessToken: "test-token",
          connectedAt: new Date(),
        },
      },
    } as any;

    expect(isMessengerConfigured(org)).toBe(true);
  });
});

describe("Survey Token", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-key-for-testing";
  });

  it("should generate and verify survey token", async () => {
    const { verifySurveyToken } = await import("~/utils/emails/sendSurvey");
    const jwt = await import("jsonwebtoken");

    const eventId = "event-123";
    const customerId = "customer-456";

    // Generate token with the same structure as sendSurvey
    const token = jwt.default.sign(
      { eventId, customerId, type: "survey" },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    // Verify token
    const result = verifySurveyToken(token);

    expect(result).not.toBeNull();
    expect(result?.eventId).toBe(eventId);
    expect(result?.customerId).toBe(customerId);
  });

  it("should return null for invalid token type", async () => {
    const { verifySurveyToken } = await import("~/utils/emails/sendSurvey");
    const jwt = await import("jsonwebtoken");

    // Generate token with wrong type
    const token = jwt.default.sign(
      { eventId: "123", customerId: "456", type: "wrong-type" },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    const result = verifySurveyToken(token);
    expect(result).toBeNull();
  });

  it("should return null for expired token", async () => {
    const { verifySurveyToken } = await import("~/utils/emails/sendSurvey");
    const jwt = await import("jsonwebtoken");

    // Generate expired token
    const token = jwt.default.sign(
      { eventId: "123", customerId: "456", type: "survey" },
      process.env.JWT_SECRET!,
      { expiresIn: "-1s" }
    );

    const result = verifySurveyToken(token);
    expect(result).toBeNull();
  });

  it("should return null for invalid signature", async () => {
    const { verifySurveyToken } = await import("~/utils/emails/sendSurvey");
    const jwt = await import("jsonwebtoken");

    // Generate token with different secret
    const token = jwt.default.sign(
      { eventId: "123", customerId: "456", type: "survey" },
      "different-secret",
      { expiresIn: "30d" }
    );

    const result = verifySurveyToken(token);
    expect(result).toBeNull();
  });
});

describe("Event Action Tokens", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-key-for-testing";
  });

  it("should generate and verify event action token", async () => {
    const { generateEventActionToken, verifyEventActionToken } = await import("~/utils/tokens");

    const payload = {
      eventId: "event-123",
      customerId: "customer-456",
      action: "confirm" as const,
    };

    const token = generateEventActionToken(payload);
    const result = verifyEventActionToken(token);

    expect(result).not.toBeNull();
    expect(result?.eventId).toBe(payload.eventId);
    expect(result?.customerId).toBe(payload.customerId);
    expect(result?.action).toBe(payload.action);
  });

  it("should verify cancel action token", async () => {
    const { generateEventActionToken, verifyEventActionToken } = await import("~/utils/tokens");

    const payload = {
      eventId: "event-789",
      customerId: "customer-012",
      action: "cancel" as const,
    };

    const token = generateEventActionToken(payload);
    const result = verifyEventActionToken(token);

    expect(result).not.toBeNull();
    expect(result?.action).toBe("cancel");
  });

  it("should verify modify action token", async () => {
    const { generateEventActionToken, verifyEventActionToken } = await import("~/utils/tokens");

    const payload = {
      eventId: "event-abc",
      customerId: "customer-def",
      action: "modify" as const,
    };

    const token = generateEventActionToken(payload);
    const result = verifyEventActionToken(token);

    expect(result).not.toBeNull();
    expect(result?.action).toBe("modify");
  });

  it("should return null for tampered token", async () => {
    const { verifyEventActionToken } = await import("~/utils/tokens");

    const tamperedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJldmVudElkIjoiZmFrZSIsImN1c3RvbWVySWQiOiJmYWtlIiwiYWN0aW9uIjoiY29uZmlybSIsImlhdCI6MTYwMDAwMDAwMH0.tampered";

    const result = verifyEventActionToken(tamperedToken);
    expect(result).toBeNull();
  });
});

describe("negativeReviewTemplate", () => {
  it("should generate valid HTML with all parameters", async () => {
    const { default: negativeReviewTemplate } = await import("~/utils/emails/negativeReviewTemplate");

    const html = negativeReviewTemplate({
      customerName: "Juan Pérez",
      serviceName: "Corte de cabello",
      rating: 2,
      comment: "El servicio fue lento",
      orgName: "Barbería Example",
      dashboardUrl: "https://example.com/dash/evaluaciones",
    });

    expect(html).toContain("Juan Pérez");
    expect(html).toContain("Corte de cabello");
    expect(html).toContain("Barbería Example");
    expect(html).toContain("2/5");
    expect(html).toContain("El servicio fue lento");
    expect(html).toContain("https://example.com/dash/evaluaciones");
    expect(html).toContain("Ver en dashboard");
  });

  it("should display correct star rating", async () => {
    const { default: negativeReviewTemplate } = await import("~/utils/emails/negativeReviewTemplate");

    const html = negativeReviewTemplate({
      customerName: "Test",
      serviceName: "Test Service",
      rating: 1,
      comment: null,
      orgName: "Test Org",
      dashboardUrl: "https://example.com",
    });

    // 1 filled star, 4 empty stars
    expect(html).toContain("★☆☆☆☆");
  });

  it("should handle null comment", async () => {
    const { default: negativeReviewTemplate } = await import("~/utils/emails/negativeReviewTemplate");

    const html = negativeReviewTemplate({
      customerName: "Test",
      serviceName: "Test Service",
      rating: 2,
      comment: null,
      orgName: "Test Org",
      dashboardUrl: "https://example.com",
    });

    // Should not contain the comment block styling
    expect(html).not.toContain("font-style:italic");
  });

  it("should include Deník branding", async () => {
    const { default: negativeReviewTemplate } = await import("~/utils/emails/negativeReviewTemplate");

    const html = negativeReviewTemplate({
      customerName: "Test",
      serviceName: "Test",
      rating: 1,
      comment: null,
      orgName: "Test Org",
      dashboardUrl: "https://example.com",
    });

    expect(html).toContain("Deník");
    expect(html).toContain("denik.me");
  });
});

describe("Negative Review Alert Logic", () => {
  const shouldSendAlert = (rating: number): boolean => rating < 3;

  it("should send alert for rating 1", () => {
    expect(shouldSendAlert(1)).toBe(true);
  });

  it("should send alert for rating 2", () => {
    expect(shouldSendAlert(2)).toBe(true);
  });

  it("should NOT send alert for rating 3", () => {
    expect(shouldSendAlert(3)).toBe(false);
  });

  it("should NOT send alert for rating 4", () => {
    expect(shouldSendAlert(4)).toBe(false);
  });

  it("should NOT send alert for rating 5", () => {
    expect(shouldSendAlert(5)).toBe(false);
  });
});

describe("Review Stats Calculation", () => {
  // Helper to calculate stats like the dashboard does
  const calculateStats = (reviews: { rating: number; customerId: string }[]) => {
    const ratingDistribution = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingDistribution[r.rating - 1]++;
      }
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        : 0;
    const uniqueCustomers = new Set(reviews.map((r) => r.customerId)).size;

    return { ratingDistribution, totalReviews, averageRating, uniqueCustomers };
  };

  it("should calculate correct distribution", () => {
    const reviews = [
      { rating: 5, customerId: "c1" },
      { rating: 5, customerId: "c2" },
      { rating: 4, customerId: "c3" },
      { rating: 3, customerId: "c4" },
      { rating: 1, customerId: "c5" },
    ];

    const stats = calculateStats(reviews);

    expect(stats.ratingDistribution).toEqual([1, 0, 1, 1, 2]); // [1star, 2star, 3star, 4star, 5star]
    expect(stats.totalReviews).toBe(5);
    expect(stats.averageRating).toBe(3.6);
    expect(stats.uniqueCustomers).toBe(5);
  });

  it("should handle empty reviews", () => {
    const stats = calculateStats([]);

    expect(stats.ratingDistribution).toEqual([0, 0, 0, 0, 0]);
    expect(stats.totalReviews).toBe(0);
    expect(stats.averageRating).toBe(0);
    expect(stats.uniqueCustomers).toBe(0);
  });

  it("should count unique customers correctly", () => {
    const reviews = [
      { rating: 5, customerId: "c1" },
      { rating: 4, customerId: "c1" }, // same customer
      { rating: 3, customerId: "c2" },
    ];

    const stats = calculateStats(reviews);

    expect(stats.totalReviews).toBe(3);
    expect(stats.uniqueCustomers).toBe(2);
  });

  it("should calculate weighted average for overall rating", () => {
    // This simulates the overall average calculation from dash.reviews.tsx
    const serviceReviews = [
      { reviewCount: 10, averageRating: 5.0 },
      { reviewCount: 5, averageRating: 3.0 },
    ];

    const totalReviews = serviceReviews.reduce((acc, s) => acc + s.reviewCount, 0);
    const overallAverage =
      totalReviews > 0
        ? serviceReviews.reduce((acc, s) => acc + s.averageRating * s.reviewCount, 0) / totalReviews
        : 0;

    expect(totalReviews).toBe(15);
    // (10*5 + 5*3) / 15 = (50 + 15) / 15 = 65/15 = 4.333...
    expect(overallAverage).toBeCloseTo(4.333, 2);
  });
});
