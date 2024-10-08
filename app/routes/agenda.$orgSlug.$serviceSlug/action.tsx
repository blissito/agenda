import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { db } from "~/utils/db.server";
import { twMerge } from "tailwind-merge";

import {
  getService,
  getUserAndOrgOrRedirect,
  getUserOrNull,
} from "~/db/userGetters";

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

  if (intent === "get_times_for_selected_date") {
    // const { org } = await getUserAndOrgOrRedirect(request);
    const service = await db.service.findUnique({
      where: {
        slug: params.serviceSlug,
      },
    });
    if (!service) throw json(null, { status: 404 });
    const events = await db.event.findMany({
      where: {
        serviceId: service.id,
      },
    });
    return { events };
  }
  return null;
};
