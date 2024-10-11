import { useState } from "react";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { Footer, Header, InfoShower } from "./components";
import { loaderFunction } from "./loader";
import { twMerge } from "tailwind-merge";
import { getMaxDate } from "./utils";
import { MonthView } from "~/components/forms/agenda/MonthView";
import TimeView from "~/components/forms/agenda/TimeView";
import { BasicInput } from "~/components/forms/BasicInput";
import { useForm } from "react-hook-form";
import { PrimaryButton } from "~/components/common/primaryButton";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { createEvent, getEvents, getService } from "~/.server/userGetters";
import { Success } from "./success";
import { db } from "~/utils/db.server";

export const userInfoSchema = z.object({
  displayName: z.string().min(1),
  comments: z.string(),
  email: z.string().email("Email no válido"),
  tel: z
    .string()
    .min(10, { message: "El teléfono debe ser de al menos 10 dígitos" }),
});

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "get_times_for_selected_date") {
    const service = await getService(params.serviceSlug);
    if (!service) throw json(null, { status: 404 });
    const selectedDate = new Date(formData.get("date"));
    const tommorrow = new Date(selectedDate);
    tommorrow.setDate(selectedDate.getDate() + 1);
    const events = await db.event.findMany({
      where: {
        start: {
          gte: new Date(selectedDate), // this is
          lte: new Date(tommorrow), // the one day only
        },
      },
    });
    return { events };
  }
  if (intent === "create_event") {
    const data = JSON.parse(formData.get("data") as string);
    // @todo: add logged user id & validation
    return { event: await createEvent(data) };
  }
  return null;
};

export const loader = loaderFunction;

export default function Page() {
  const { org, service } = useLoaderData<typeof loaderFunction>();
  const [time, setTime] = useState<number>();
  const [date, setDate] = useState<Date>();
  const [show, setShow] = useState("");

  const fetcher = useFetcher<typeof action>();
  const onSubmit = (vals) => {
    const result = userInfoSchema.safeParse(vals);
    if (!result.success) {
      result.error.errors.map((e) => {
        setError(e.path[0], e);
      });
      return;
    }
    const customer = result.data;
    fetcher.submit(
      {
        intent: "create_event",
        data: JSON.stringify({
          start: new Date(date),
          dateString: new Date(date).toLocaleString(),
          customer, // @todo: add logged user id
          duration: service.duration,
          serviceId: service.id,
          title: service.name,
          status: "ACTIVE",
          // @todo: end
        }), // iso for mongodb? No. But, we need timezoned dates @todo
      },
      { method: "post" }
    );
    setShow("success");
  };

  const maxDate = getMaxDate(
    new Date(new Date().getFullYear(), new Date().getMonth() + 2)
  );

  const handleTimeSelection = (timeString, h, m) => {
    const updated = new Date(date);
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
    formState: { isValid, errors },
    setError,
    handleSubmit,
    register,
  } = useForm({
    defaultValues: { displayName: "", email: "", tel: "", comments: "" },
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
    <article className=" bg-[#f8f8f8] min-h-screen h-screen relative">
      <Header org={org} />
      <main className="shadow mx-auto rounded-xl p-8 w-[90%] min-h-[506px] md:w-fit z-50">
        <section className={twMerge("flex flex-wrap")}>
          <InfoShower service={service} org={org} date={date} />
          {show !== "user_info" && (
            <>
              <MonthView
                selected={date}
                onSelect={setDate}
                maxDate={maxDate}
                weekDays={service.weekDays || org.weekDays}
              />
              {date && (
                <TimeView
                  intent="get_times_for_selected_date"
                  slotDuration={service.duration}
                  onSelect={handleTimeSelection}
                  weekDays={service.weekDays || org.weekDays}
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
            //   onSubmit={onSubmit}
            onSubmit={handleNextForm}
            isValid={!!date && !!time}
            isLoading={fetcher.state !== "idle"}
            errors={errors} // @todo fix this
          />
        )}
      </main>
    </article>
  );
}
