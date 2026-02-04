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
