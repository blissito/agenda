/**
 * Development/fallback route: /agenda/:orgSlug/:serviceSlug
 * This route works on localhost where subdomains don't work.
 * In production, the subdomain route (service.$serviceSlug.tsx) is preferred.
 */
import { useState } from "react";
import { Form, useFetcher } from "react-router";
import { Footer, Header, InfoShower } from "~/components/agenda/components";
import { twMerge } from "tailwind-merge";
import { getMaxDate } from "~/components/agenda/utils";
import { MonthView } from "~/components/forms/agenda/MonthView";
import TimeView from "~/components/forms/agenda/TimeView";
import { BasicInput } from "~/components/forms/BasicInput";
import { useForm } from "react-hook-form";
import { PrimaryButton } from "~/components/common/primaryButton";
import { z } from "zod";
import { Success } from "~/components/agenda/success";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/agenda.$orgSlug.$serviceSlug";
import {
  sendAppointmentToCustomer,
  sendAppointmentToOwner,
} from "~/utils/emails/sendAppointment";
import { convertWeekDaysToEnglish } from "~/utils/urls";
import { emit } from "~/plugins/index";
import "~/plugins/register";

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

  // Get org from URL param
  const org = await db.org.findUnique({ where: { slug: params.orgSlug } });
  if (!org) throw new Response("Org not found", { status: 404 });

  if (intent === "get_times_for_selected_date") {
    const service = await db.service.findUnique({
      where: { slug: params.serviceSlug },
    });
    if (!service || service.orgId !== org.id) {
      throw new Response(null, { status: 404 });
    }

    const dateStr = formData.get("date") as string;
    const selectedDate = new Date(dateStr);
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(selectedDate.getDate() + 1);
    const events = await db.event.findMany({
      where: {
        start: {
          gte: new Date(selectedDate),
          lte: new Date(tomorrow),
        },
        orgId: org.id,
      },
    });
    return { events };
  }

  if (intent === "create_event") {
    const data = JSON.parse(formData.get("data") as string);

    const service = await db.service.findUnique({
      where: { id: data.serviceId },
    });
    if (!service || service.orgId !== org.id) {
      throw new Response("Service not found", { status: 404 });
    }

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
        paid: false,
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

    return { event, org };
  }

  return null;
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  // Get org from URL param
  const org = await db.org.findUnique({ where: { slug: params.orgSlug } });
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

  if (!service) throw new Response("Service not found", { status: 404 });

  // Verify service belongs to org
  if (service.orgId !== org.id) {
    throw new Response("Service not found", { status: 404 });
  }

  // Convert weekDays from Spanish (DB) to English (UI)
  const serviceWeekDays = convertWeekDaysToEnglish(
    service.weekDays as Record<string, any>,
    false
  );
  const orgWeekDays = convertWeekDaysToEnglish(
    org.weekDays as Record<string, any>,
    true
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
  };

  return { org: orgWithEnglishDays, service: serviceWithEnglishDays };
};

export default function Page({ loaderData }: Route.ComponentProps) {
  const { org, service } = loaderData;
  const [time, setTime] = useState<string>();
  const [date, setDate] = useState<Date>();
  const [show, setShow] = useState("");
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

  if (show === "success") {
    return (
      <Success
        org={org}
        event={fetcher.data?.event}
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
          <InfoShower service={service} org={org} date={date} />
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
                  action={`/agenda/${org.slug}/${service.slug}`}
                />
              )}
            </>
          )}
          {show === "user_info" && (
            <Form onSubmit={handleSubmit(onSubmit)} className="">
              <BasicInput
                register={register}
                name="displayName"
                label="Nombre"
                error={errors.displayName}
              />
              <div className="flex gap-4">
                <BasicInput
                  error={errors.email}
                  register={register}
                  name="email"
                  label="Email"
                />
                <BasicInput
                  error={errors.tel}
                  name="tel"
                  register={register}
                  label="Teléfono"
                />
              </div>
              <BasicInput
                error={errors.comments}
                as="textarea"
                label="Comentarios"
                register={register}
                name="comments"
                registerOptions={{ required: false }}
              />
              <PrimaryButton
                isDisabled={!isValid}
                className="ml-auto"
                type="submit"
              >
                Agendar
              </PrimaryButton>
            </Form>
          )}
        </section>
        {show !== "user_info" && (
          <Footer
            onSubmit={handleNextForm}
            isValid={!!date && !!time}
            isLoading={fetcher.state !== "idle"}
          />
        )}
      </main>
    </article>
  );
}
