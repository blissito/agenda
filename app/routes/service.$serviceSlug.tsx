/**
 * Clean URL route for subdomains/custom domains: /:serviceSlug
 * Org is resolved from the hostname, not from URL params.
 */
import { useState } from "react";
import { Form, redirect, useFetcher } from "react-router";
import { Footer, Header, InfoShower } from "~/components/agenda/components";
import { twMerge } from "tailwind-merge";
import { getMaxDate } from "~/components/agenda/utils";
import { MonthView } from "~/components/forms/agenda/MonthView";
import TimeView from "~/components/forms/agenda/TimeView";
import { BasicInput } from "~/components/forms/BasicInput";
import { useForm } from "react-hook-form";
import { PrimaryButton } from "~/components/common/primaryButton";
import { z } from "zod";
import { getService } from "~/.server/userGetters";
import { Success } from "~/components/agenda/success";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/service.$serviceSlug";
import {
  sendAppointmentToCustomer,
  sendAppointmentToOwner,
} from "~/utils/emails/sendAppointment";
import { resolveOrgFromRequest } from "~/utils/host.server";
import { convertWeekDaysToEnglish } from "~/utils/urls";
import { createPreference, getValidAccessToken } from "~/.server/mercadopago";
import {
  DEFAULT_TIMEZONE,
  type SupportedTimezone,
} from "~/utils/timezone";

type WeekDaysType = Record<string, string[][]>;

export const userInfoSchema = z.object({
  displayName: z.string().min(1),
  comments: z.string(),
  email: z.string().email("Email no válido"),
  tel: z
    .string()
    .min(10, { message: "El teléfono debe ser de al menos 10 dígitos" }),
});

type UserInfoForm = z.infer<typeof userInfoSchema>;

export const action = async ({ request, params }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "get_times_for_selected_date") {
    const service = await getService(params.serviceSlug);
    if (!service) throw new Response(null, { status: 404 });
    const dateStr = formData.get("date") as string;
    const selectedDate = new Date(dateStr);
    const tommorrow = new Date(selectedDate);
    tommorrow.setDate(selectedDate.getDate() + 1);
    const events = await db.event.findMany({
      where: {
        start: {
          gte: new Date(selectedDate),
          lte: new Date(tommorrow),
        },
      },
    });
    return { events };
  }
  if (intent === "create_event") {
    const data = JSON.parse(formData.get("data") as string);

    // Org is resolved from hostname (subdomain or custom domain)
    const org = await resolveOrgFromRequest(request, undefined);
    if (!org) throw new Response("Org not found", { status: 404 });

    // Buscar servicio para verificar si requiere pago
    const service = await db.service.findUnique({
      where: { id: data.serviceId },
    });
    if (!service) throw new Response("Service not found", { status: 404 });

    const customer = await db.customer.create({
      data: {
        displayName: data.customer.displayName,
        email: data.customer.email,
        tel: data.customer.tel || "",
        comments: data.customer.comments || "",
        org: { connect: { id: org.id } },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const startDate = new Date(data.start);
    const endDate = new Date(startDate.getTime() + data.duration * 60 * 1000);

    // Si el servicio requiere pago, redirigir a MP
    if (service.payment && Number(service.price) > 0) {
      // Obtener owner para tokens de MP
      const owner = await db.user.findUnique({
        where: { id: org.ownerId },
      });

      const accessToken = await getValidAccessToken(owner);
      if (!accessToken) {
        return {
          error: "Este servicio requiere pago pero el negocio no tiene configurado su método de pago. Por favor contacta directamente al negocio.",
        };
      }

      // Use main app URL for MP callbacks (subdomains may not be whitelisted in MP)
      const appUrl = process.env.APP_URL || new URL(request.url).origin;

      try {
        const preference = await createPreference(accessToken, {
          serviceId: service.id,
          serviceName: service.name,
          price: Number(service.price),
          customerId: customer.id,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          backUrl: appUrl,
          webhookUrl: `${appUrl}/mercadopago/webhook`,
        });

        if (preference.init_point) {
          // Redirigir a MP, el evento se crea en el webhook
          throw redirect(preference.init_point);
        }
      } catch (e) {
        // Re-throw redirects
        if (e instanceof Response) throw e;
        console.error("MercadoPago preference error:", e);
        return {
          error: "Error al procesar el pago. Por favor intenta de nuevo.",
        };
      }
    }

    // Servicio gratuito o sin MP configurado: crear evento directamente
    const event = await db.event.create({
      data: {
        start: startDate,
        end: endDate,
        duration: data.duration,
        service: { connect: { id: data.serviceId } },
        title: data.title,
        status: data.status,
        org: { connect: { id: org.id } },
        customer: { connect: { id: customer.id } },
        allDay: false,
        archived: false,
        createdAt: new Date(),
        paid: !service.payment, // true si es gratuito
        type: "appointment",
        userId: org.ownerId,
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        service: { include: { org: true } },
      },
    });

    // Emit booking.created event for plugins
    const { emit } = await import("~/plugins/index.server");
    await import("~/plugins/register.server");
    await emit("booking.created", { event, service, customer }, org.id);

    try {
      await sendAppointmentToCustomer({
        email: customer.email,
        event: event as any,
      });
      if (org.email) {
        await sendAppointmentToOwner({
          email: org.email,
          event: event as any,
        });
      }
    } catch (e) {
      console.error("Email send failed:", e);
    }

    // Schedule reminder and survey notifications
    try {
      const { scheduleEventNotifications } = await import("~/jobs/definitions.server");
      await scheduleEventNotifications(
        event.id,
        startDate,
        endDate,
        service.config as { reminder?: boolean; survey?: boolean; reminderHours?: number | null } | undefined
      );
    } catch (e) {
      console.error("Failed to schedule notifications:", e);
    }

    return { event, org };
  }
  return null;
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  // Org is resolved from hostname (subdomain or custom domain)
  const org = await resolveOrgFromRequest(request, undefined);
  if (!org) throw new Response("Org not found", { status: 404 });

  const service = await db.service.findUnique({
    where: {
      slug: params.serviceSlug,
    },
    include: {
      events: {
        where: {
          status: "ACTIVE",
        },
      },
    },
  });
  if (!service) throw new Response(null, { status: 404 });

  // Verify service belongs to org
  if (service.orgId !== org.id) throw new Response(null, { status: 404 });

  // Convert weekDays from Spanish (DB) to English (UI)
  // Service weekDays: don't use default, fallback to org's schedule
  const serviceWeekDays = convertWeekDaysToEnglish(
    service.weekDays as Record<string, any>,
    false // Don't use default, let component fallback to org.weekDays
  );
  // Org weekDays: use default if none configured
  const orgWeekDays = convertWeekDaysToEnglish(
    org.weekDays as Record<string, any>,
    true // Use default schedule if org has none
  );

  const serviceWithEnglishDays = {
    ...service,
    weekDays: Object.keys(serviceWeekDays).length > 0 ? serviceWeekDays : null,
    // Convert BigInt to Number for client-side usage
    duration: Number(service.duration),
    price: Number(service.price),
    points: Number(service.points),
    seats: Number(service.seats),
  };
  const orgWithEnglishDays = {
    ...org,
    weekDays: orgWeekDays,
    // Include timezone from org or use default
    timezone: (org.timezone as SupportedTimezone) || DEFAULT_TIMEZONE,
  };

  return { org: orgWithEnglishDays, service: serviceWithEnglishDays };
};

export default function Page({ loaderData }: Route.ComponentProps) {
  const { org, service } = loaderData;
  const [time, setTime] = useState<string>();
  const [date, setDate] = useState<Date>();
  const [show, setShow] = useState("");
  const [timezone, setTimezone] = useState<SupportedTimezone>(
    org.timezone as SupportedTimezone
  );
  const fetcher = useFetcher<typeof action>();

  const onSubmit = (vals: UserInfoForm) => {
    const result = userInfoSchema.safeParse(vals);
    if (!result.success) {
      result.error.issues.forEach((e) => {
        setError(e.path[0] as keyof UserInfoForm, { message: e.message });
      });
      return;
    }
    if (!date) return;
    const customer = result.data;
    fetcher.submit(
      {
        intent: "create_event",
        data: JSON.stringify({
          start: date.toISOString(),
          dateString: date.toISOString(),
          customer,
          duration: service.duration,
          serviceId: service.id,
          title: service.name,
          status: "ACTIVE",
        }),
      },
      { method: "post" }
    );
    setShow("success");
  };

  const maxDate = getMaxDate(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  );

  const handleTimeSelection = (timeString: string, h: number, m: number) => {
    const updated = new Date(date as Date);
    updated.setHours(h);
    updated.setMinutes(m);
    setDate(updated);
    setTime(timeString);
  };

  const handleNextForm = () => {
    if (show !== "user_info") {
      setShow("user_info");
    }
  };

  const handleTimezoneChange = (newTimezone: SupportedTimezone) => {
    // When timezone changes, convert the selected time to the new timezone
    // The same moment in time should remain selected, just displayed differently
    if (time && date) {
      // Get the offset difference between timezones
      const oldOffset = new Date().toLocaleString("en-US", { timeZone: timezone, timeZoneName: "shortOffset" });
      const newOffset = new Date().toLocaleString("en-US", { timeZone: newTimezone, timeZoneName: "shortOffset" });

      // Parse offsets (e.g., "GMT-6" -> -6)
      const parseOffset = (str: string) => {
        const match = str.match(/GMT([+-]?\d+)/);
        return match ? parseInt(match[1]) : 0;
      };

      const oldOffsetHours = parseOffset(oldOffset);
      const newOffsetHours = parseOffset(newOffset);
      const diffHours = newOffsetHours - oldOffsetHours;

      // Convert current time to new timezone
      const [h, m] = time.split(":").map(Number);
      let newHour = h + diffHours;

      // Handle day boundaries
      if (newHour >= 0 && newHour < 24) {
        const newTimeString = `${newHour.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        setTime(newTimeString);

        // Update date with new hour
        const updatedDate = new Date(date);
        updatedDate.setHours(newHour);
        updatedDate.setMinutes(m);
        setDate(updatedDate);
      } else {
        // Time falls on different day, clear selection
        setTime(undefined);
      }
    }
    setTimezone(newTimezone);
  };

  const {
    formState: { errors, isValid },
    setError,
    handleSubmit,
    register,
  } = useForm<UserInfoForm>({
    defaultValues: { displayName: "", email: "", tel: "", comments: "" },
    mode: "onChange",
  });

  const reset = () => {
    setShow("");
    setDate(undefined);
    setTime(undefined);
  };

  // Mostrar error si el action retornó error
  const actionError = fetcher.data && "error" in fetcher.data ? fetcher.data.error : null;

  // Mostrar success solo si hay evento creado
  if (show === "success" && fetcher.data?.event) {
    return (
      <Success
        org={org}
        event={fetcher.data.event}
        service={service}
        onFinish={reset}
      />
    );
  }

  return (
    <article className=" bg-[#f8f8f8] relative">
      <Header org={org} />
      <main className="shadow mx-auto rounded-xl p-8 min-h-[506px] md:w-max w-1/2">
        <section className={twMerge("flex flex-wrap")}>
          <InfoShower service={service} org={org} date={date} timezone={timezone} />
          {show !== "user_info" && (
            <>
              <MonthView
                selected={date}
                onSelect={setDate}
                maxDate={maxDate}
                weekDays={(service.weekDays || org.weekDays) as WeekDaysType}
              />
              {date && (
                <TimeView
                  intent="get_times_for_selected_date"
                  slotDuration={service.duration}
                  onSelect={handleTimeSelection}
                  weekDays={(service.weekDays || org.weekDays) as WeekDaysType}
                  selected={date}
                  action={`/${service.slug}`}
                  timezone={timezone}
                  orgTimezone={org.timezone as SupportedTimezone}
                  onTimezoneChange={handleTimezoneChange}
                  selectedTime={time}
                />
              )}
            </>
          )}
          {show === "user_info" && (
            <Form onSubmit={handleSubmit(onSubmit)} className="flex-1">
              <h3 className="text-lg font-bold mb-6 text-brand_dark">Cuéntanos sobre ti</h3>
              {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {actionError}
                </div>
              )}
              <BasicInput
                register={register}
                name="displayName"
                label="Nombre"
                placeholder="Nombre completo"
                error={errors.displayName}
              />
              <div className="flex gap-4">
                <BasicInput
                  error={errors.email}
                  register={register}
                  name="email"
                  label="Email"
                  placeholder="ejemplo@ejemplo.com"
                />
                <BasicInput
                  error={errors.tel}
                  name="tel"
                  register={register}
                  label="Teléfono"
                  placeholder="555 555 55 66"
                />
              </div>
              <BasicInput
                error={errors.comments}
                as="textarea"
                label="Notas o comentarios"
                register={register}
                name="comments"
                placeholder="Cualquier cosa que ayude a prepararnos para nuestra cita."
                registerOptions={{ required: false }}
              />
            </Form>
          )}
        </section>
        {show !== "user_info" ? (
          <Footer
            onSubmit={handleNextForm}
            isValid={!!date && !!time}
            isLoading={fetcher.state !== "idle"}
          />
        ) : (
          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={() => setShow("")}
              className="flex items-center gap-2 bg-[#f5f5f5] text-brand_dark px-4 py-3 rounded-full hover:bg-gray-200 transition-colors"
            >
              <span className="text-lg">←</span>
              <span className="font-medium">Volver</span>
            </button>
            <PrimaryButton
              isDisabled={!isValid || fetcher.state !== "idle"}
              onClick={handleSubmit(onSubmit)}
              type="button"
            >
              {fetcher.state !== "idle" ? "Agendando..." : "Continuar"}
            </PrimaryButton>
          </div>
        )}
      </main>
    </article>
  );
}
