import { useState } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Footer, Header, InfoShower } from "./components";
import { loaderFunction } from "./loader";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { getMaxDate } from "./utils";
import { MonthView } from "~/components/forms/agenda/MonthView";

export const loader = loaderFunction;

export default function Page() {
  const { org, service } = useLoaderData<typeof loader>();
  //   const [time, setTime] = useState();
  const [date, setDate] = useState<Date>();

  const fetcher = useFetcher<typeof action>();
  const {
    formState: { errors, isValid },
    setError,
    getValues,
  } = useForm({
    defaultValues: {
      date: "",
      time: "",
    },
  });
  const onSubmit = () => {
    const values = getValues();
    if (!values.date) return setError("date", { message: "Selecciona un día" });
    if (!values.time)
      return setError("time", { message: "Selecciona una hora" });
    fetcher.submit(
      {
        intent: "date_time_selected",
        data: JSON.stringify({
          date: new Date(date).toISOString(),
          dateString: new Date(date).toLocaleString(),
        }), // iso for mongodb? No.
      },
      { method: "post" }
    );
  };

  const maxDate = getMaxDate(
    new Date(new Date().getFullYear(), new Date().getMonth() + 2)
  );

  return (
    <article className=" bg-[#f8f8f8] min-h-screen h-screen relative">
      <Header org={org} />
      <main className="shadow mx-auto rounded-xl p-8 w-[90%] min-h-[506px] md:w-fit z-50">
        <section className={twMerge("flex flex-wrap")}>
          <InfoShower service={service} org={org} date={date} />
          <MonthView
            maxDate={maxDate}
            weekDays={service.weekDays || org.weekDays}
          />
        </section>
        <Footer
          onSubmit={onSubmit}
          isValid={isValid}
          isLoading={fetcher.state !== "idle"}
          errors={errors}
        />
      </main>
    </article>
  );
}
