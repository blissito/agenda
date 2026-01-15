import appointmentCustomerTemplate from "./appointmentCustomerTemplate";
import type { Customer, Event, Org, Service, User } from "@prisma/client";
import appointmentOwnerTemplate from "./appointmentOwnerTemplate";
import { getRemitent, getSesTransport } from "./ses";
import { formatDateForDisplay } from "~/utils/formatDate";

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
  const url = new URL(request?.url || "https://denik.me");
  url.pathname = "/dash";

  const sesTransport = getSesTransport();

  return sesTransport
    .sendMail({
      from: getRemitent(),
      subject: subject || "🗓️ ¡Cita agendada!",
      to: email,
      html: appointmentCustomerTemplate({
        displayName: event.service.org.shopKeeper ?? undefined,
        link: url.toString(),
        amount: event.service.price,
        address: event.service.org.address ?? undefined,
        dateString: formatDateForDisplay(event.start),
        minutes: event.duration ?? undefined,
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
  const url = new URL(request?.url || "https://denik.me");
  url.pathname = "/dash";

  const sesTransport = getSesTransport();

  return sesTransport
    .sendMail({
      from: getRemitent(),
      subject: subject || "🗓️ Tienes una nueva reunion",
      to: email,
      html: appointmentOwnerTemplate({
        displayName: event.service.org.shopKeeper ?? undefined,
        link: url.toString(),
        amount: event.service.price,
        address: event.service.org.address ?? undefined,
        dateString: formatDateForDisplay(event.start),
        minutes: event.duration ?? undefined,
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
