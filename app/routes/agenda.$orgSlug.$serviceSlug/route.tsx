import { useState } from "react";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { Footer, Header, InfoShower } from "./components";
import { loaderFunction } from "./loader";
import { twMerge } from "tailwind-merge";
import { getMaxDate } from "./utils";
import { MonthView } from "~/components/forms/agenda/MonthView";
import TimeView from "~/components/forms/agenda/TimeView";
import { actionFunction } from "./action";
import { BasicInput } from "~/components/forms/BasicInput";
import { TextAreaInput } from "~/components/forms/TextAreaInput";
import { useForm } from "react-hook-form";
import { PrimaryButton } from "~/components/common/primaryButton";

export const action = actionFunction;
export const loader = loaderFunction;

export default function Page() {
  const { org, service } = useLoaderData<typeof loaderFunction>();
  const [time, setTime] = useState<number>();
  const [date, setDate] = useState<Date>();
  const [show, setShow] = useState("");

  const fetcher = useFetcher<typeof action>();
  const onSubmit = (vals) => {
    console.log("vals: ", vals);
    return;
    fetcher.submit(
      {
        intent: "date_time_selected",
        data: JSON.stringify({
          date: new Date(date).toISOString(),
          dateString: new Date(date).toLocaleString(),
        }), // iso for mongodb? No. But, we need timezoned dates @todo
      },
      { method: "post" }
    );
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
    if (show === "user_info") {
    } else {
      setShow("user_info");
    }
  };

  const {
    formState: { isValid, errors },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: { displayName: "", email: "", tel: "", comments: "" },
  });
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
