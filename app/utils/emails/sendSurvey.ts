import surveyTemplate from "./surveyTemplate";
import type { Customer, Event, Org, Service } from "@prisma/client";
import { getRemitent, getSesTransport } from "./ses";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-me";

type ServiceWithOrg = Service & {
  org: Org;
};

type FullEvent = Event & {
  service: ServiceWithOrg;
  customer: Customer;
};

/**
 * Generate a survey token for the customer to rate their experience
 */
function generateSurveyToken(eventId: string, customerId: string): string {
  return jwt.sign(
    { eventId, customerId, type: "survey" },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

/**
 * Send satisfaction survey email to customer after their appointment
 */
export const sendSurvey = async ({
  email,
  event,
}: {
  event: FullEvent;
  email: string;
}) => {
  const baseUrl = process.env.APP_URL || "https://denik.me";

  // Generate survey token
  const surveyToken = generateSurveyToken(event.id, event.customer.id);
  const surveyLink = `${baseUrl}/survey?token=${surveyToken}`;

  const sesTransport = getSesTransport();

  return sesTransport
    .sendMail({
      from: getRemitent(),
      subject: `${event.customer.displayName}, ¿cómo fue tu experiencia en ${event.service.org.name}?`,
      to: email,
      html: surveyTemplate({
        serviceName: event.service.name,
        orgName: event.service.org.name,
        customerName: event.customer.displayName ?? undefined,
        surveyLink,
      }),
    })
    .catch((e: unknown) => {
      console.error("Error sending survey email:", e);
      throw e;
    });
};

/**
 * Verify a survey token
 */
export function verifySurveyToken(token: string): {
  eventId: string;
  customerId: string;
} | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      eventId: string;
      customerId: string;
      type: string;
    };
    if (decoded.type !== "survey") return null;
    return { eventId: decoded.eventId, customerId: decoded.customerId };
  } catch {
    return null;
  }
}
