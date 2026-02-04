import appointmentCustomerTemplate from "./appointmentCustomerTemplate";
import type { Customer, Event, Org, Service, User } from "@prisma/client";
import appointmentOwnerTemplate from "./appointmentOwnerTemplate";
import { getRemitent, getSesTransport } from "./ses";
import { formatDateForDisplay } from "~/utils/formatDate";
import { generateEventActionToken, generateUserToken } from "~/utils/tokens";
import { formatFullDateInTimezone, DEFAULT_TIMEZONE } from "~/utils/timezone";

type ServiceWithOrg = Service & {
  org: Org & { owner?: User };
};
type FullEvent = Event & {
  service: ServiceWithOrg;
  customer: Customer;
};

export const sendAppointmentToCustomer = async ({
  email,
  request,
  subject,
  event,
}: {
  event: FullEvent;
  email: string;
  request?: Request;
  subject?: string;
}) => {
  const baseUrl = process.env.APP_URL || "https://denik.me";

  // Generate tokens for event actions
  const confirmToken = generateEventActionToken({
    eventId: event.id,
    customerId: event.customer.id,
    action: "confirm",
  });
  const modifyToken = generateEventActionToken({
    eventId: event.id,
    customerId: event.customer.id,
    action: "modify",
  });

  const confirmLink = `${baseUrl}/event/action?token=${confirmToken}`;
  const modifyLink = `${baseUrl}/event/action?token=${modifyToken}`;

  // Get timezone from org or use default
  const timezone =
    (event.service.org as Org & { timezone?: string }).timezone ||
    DEFAULT_TIMEZONE;

  const sesTransport = getSesTransport();

  return sesTransport
    .sendMail({
      from: getRemitent(),
      subject: subject || "🗓️ ¡Cita agendada!",
      to: email,
      html: appointmentCustomerTemplate({
        displayName: event.service.org.shopKeeper ?? undefined,
        confirmLink,
        modifyLink,
        amount: Number(event.service.price),
        address: event.service.org.address ?? undefined,
        dateString: formatFullDateInTimezone(event.start, timezone),
        minutes: event.duration ? Number(event.duration) : undefined,
        reservationNumber: event.id,
        serviceName: event.service.name,
        orgName: event.service.org.name,
        customerName: event.customer.displayName ?? undefined,
      }),
    })
    .catch((e: unknown) => {
      console.error("Error sending appointment email to customer:", e);
    });
};

export const sendAppointmentToOwner = async ({
  request,
  email,
  subject,
  event,
}: {
  email: string;
  event: FullEvent;
  request?: Request;
  subject?: string;
}) => {
  if (!email) {
    console.error("sendAppointmentToOwner: No email provided");
    return;
  }

  const baseUrl = process.env.APP_URL || "https://denik.me";

  // Generate magic link for auto-login
  // Token includes owner email, redirects to event modify page after login
  const ownerToken = generateUserToken(email);
  const destination = `/event/${event.id}/modify`;
  const link = `${baseUrl}/login/signin?token=${ownerToken}&next=${encodeURIComponent(destination)}`;

  // Get timezone from org or use default
  const timezone =
    (event.service.org as Org & { timezone?: string }).timezone ||
    DEFAULT_TIMEZONE;

  const sesTransport = getSesTransport();

  return sesTransport
    .sendMail({
      from: getRemitent(),
      subject: subject || "🗓️ Tienes una nueva reunion",
      to: email,
      html: appointmentOwnerTemplate({
        displayName: event.service.org.shopKeeper ?? undefined,
        link,
        amount: Number(event.service.price),
        address: event.service.org.address ?? undefined,
        dateString: formatFullDateInTimezone(event.start, timezone),
        minutes: event.duration ? Number(event.duration) : undefined,
        reservationNumber: event.id,
        serviceName: event.service.name,
        orgName: event.service.org.name,
        customerName: event.customer.displayName ?? undefined,
      }),
    })
    .catch((e: unknown) => {
      console.error("Error sending appointment email to owner:", e);
    });
};
