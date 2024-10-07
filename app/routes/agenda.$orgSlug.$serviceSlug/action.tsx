import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { db } from "~/utils/db.server";
import { twMerge } from "tailwind-merge";

import { getUserOrNull } from "~/db/userGetters";

import { MonthView } from "~/components/forms/agenda/DateAndTimePicker";
import { useForm } from "react-hook-form";
import {
  addMinutesToDate,
  from12To24,
} from "~/components/dash/agenda/agendaUtils";
import {
  sendAppointmentToCustomer,
  sendAppointmentToOwner,
} from "~/utils/emails/sendAppointment";
import invariant from "tiny-invariant";

export const actionFunction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "date_time_selected") {
    const data = JSON.parse(formData.get("data") as string);
    // const user = await getUserOrNull(request);
    const service = await db.service.findUnique({
      where: { slug: params.serviceSlug },
    });
    if (!service)
      return json({ message: "Servicio no encontrado 😤" }, { status: 404 });
    // @TODO: Validation????? 🤬
    // @TODO: from users locales
    // const format = new Intl.DateTimeFormat("es-MX", {
    //   timeZone: "America/Mexico_City",
    //   day: "numeric",
    //   month: "numeric",
    //   year: "numeric",
    //   hour12: true,
    //   hour: "numeric",
    //   minute: "numeric",
    // });
    // const date = format.format(new Date(data.date));
    const evnt = {
      dateString: data.dateString,
      start: data.date,
      duration: service.duration,
      end: addMinutesToDate(data.date, service.duration),
      serviceId: service.id,
      // userId: user?.id, // @TODO: Improve
      title: service.name,
      customer: {},
      // orgId: "prueba",
    };
    const event = await db.event.create({
      data: evnt,
    });
    return { screen: "form", eventId: event.id };
  }
  if (intent === "save_customer") {
    const data = JSON.parse(formData.get("data") as string);
    const user = await getUserOrNull(request);

    const newData = {
      customer: {
        loggedUserId: user?.id,
        displayName: data.displayName,
        email: data.email,
        tel: data.tel,
        comments: data.comments,
      },
      status: "ACTIVE",
    };
    const event = await db.event.update({
      where: { id: data.eventId },
      data: newData, // @TODO: fix types
      include: { service: true }, // event.servive.org
    });
    if (!event) throw json(null, { status: 404 });
    const org = await db.org.findUnique({
      where: { id: event.service.orgId }, // @TODO: fix types and owner validation
    });
    invariant(org);
    const owner = await db.user.findUnique({ where: { id: org.ownerId } }); // @TODO: fix triple query
    invariant(owner);
    const e = {
      ...event,
      service: { ...event.service, org: { ...org, owner } }, // @TODO: WTF?
    };
    // mail sending
    sendAppointmentToOwner({ email: owner.email, request, event: e }); // @TODO: maybe fail if not await?
    await sendAppointmentToCustomer({ email: data.email, request, event: e });
    // redirection
    const url = new URL(request.url);
    url.searchParams.set("eventId", event.id);
    return redirect(url.toString());
  }
  console.info("MISSED::INTENT:: ", intent);
  return null;
};
