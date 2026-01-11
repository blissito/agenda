// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import appointmentCustomerTemplate from "./appointmentCustomerTemplate";
import type { Event, Org, Service, User } from "@prisma/client";
import appointmentOwnerTemplate from "./appointmentOwnerTemplate";
import { getRemitent, getSesTransport } from "./ses";

type FullOrg = Org & {
  org: (Org & { owner: User }) | Org;
};
type FullEvent = Event & {
  service: Service & FullOrg;
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
        // @TODO: Is it worth to save all this info in the event? 🧐
        displayName: event.service.org.shopKeeper ?? undefined, // <======================

        link: url.toString(),
        amount: event.service.price,
        address: event.service.org.address ?? undefined,
        dateString: new Date(event.start).toLocaleString("es-MX"), // @TODO: test in server and revisit to finally find a solution ⏲
        minutes: event.duration ?? undefined,
        reservationNumber: event.id,
        serviceName: event.service.name,
        orgName: event.service.org.name,
        customerName: event.customer.displayName ?? undefined,
      }),
    })
    .then((r: any) => {
      console.log(r);
    })
    .catch((e: any) => console.log(e));
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
  if (!email) return console.error("NO_EMAIL_FOUND_ON_CALL");
  const url = new URL(request?.url || "https://denik.me");
  url.pathname = "/dash";

  const sesTransport = getSesTransport();

  return sesTransport
    .sendMail({
      from: getRemitent(),
      subject: subject || "🗓️ Tienes una nueva reunion",
      to: email,
      html: appointmentOwnerTemplate({
        // @TODO: Is it worth to save all this info in the event? 🧐
        displayName: event.service.org.shopKeeper ?? undefined, // <======================

        link: url.toString(),
        amount: event.service.price,
        address: event.service.org.address ?? undefined,
        dateString: new Date(event.start).toLocaleString("es-MX"), // @TODO: test in server and revisit to finally find a solution ⏲
        minutes: event.duration ?? undefined,
        reservationNumber: event.id,
        serviceName: event.service.name,
        orgName: event.service.org.name,
        customerName: event.customer.displayName ?? undefined,
      }),
    })
    .then((r: any) => {
      console.log(r);
    })
    .catch((e: any) => console.log(e));
};
