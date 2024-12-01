import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { getUserOrRedirect } from "~/.server/userGetters";
import { useToast } from "~/components/hooks/useToaster";
import agenda, { scheduleMail } from "~/lib/hokify_agenda";
import { cn } from "~/utils/cn";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete_job") {
    const id = formData.get("id") as string;
    // const r = await agenda.db.removeJobs({ _id: { equals: id } });
    const job = await agenda.purge(); // @todo chek what's up?
  }

  if (intent === "agenda_experiment") {
    const when = formData.get("when") as string;

    const jobId = await scheduleMail({
      template: "send_experiment",
      emails: ["brenda@fixter.org", "fixtergeek@gmail.com"],
      // @todo How to assure timezonne? WITH ISOSTRING!
      when: when
        ? when
        : new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
            // new Date().getHours(),
            20,
            15
            // new Date().getMinutes() + 1
          ),
    });
    return { jobId };
  }

  return null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await getUserOrRedirect(request);
  await agenda.start();

  return {
    jobs: await agenda.db.getJobs({}, { nextRunAt: -1 }),
  };
};

export default function Route() {
  const { jobs = [{ name: "Perro", nextRuAt: null }] } =
    useLoaderData<typeof loader>();
  const toast = useToast();
  const fetcher = useFetcher<typeof action>();

  const removeJob = (id: string) => () => {
    if (!confirm("Estás segura de borrar el job:" + id + "?")) return;
    fetcher.submit(
      {
        id,
        intent: "delete_job",
      },
      { method: "POST" }
    );
  };

  const format = (date: Date) =>
    !date
      ? "no_runs_yet"
      : new Date(date).toLocaleDateString("es-MX", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          timeZone: "America/Mexico_City",
        });

  const handleDateSubmit = (e) => {
    e.preventDefault();
    const date = new Date(e.currentTarget.when.value).toISOString(); // to include timezon

    fetcher.submit(
      {
        when: date,
        intent: "agenda_experiment",
      },
      { method: "POST" }
    );
  };

  useEffect(() => {
    if (fetcher.data?.jobId) {
      console.log("JobId to pull later:", fetcher.data.jobId);
    }
  }, [fetcher]);

  return (
    <article className="bg-gray-300 h-screen flex items-center justify-center flex-col gap-8">
      <h2 className="text-4xl">Blissmo's Agendamiento experiment</h2>
      <Form method="POST" onSubmit={handleDateSubmit}>
        <input
          name="when"
          type="datetime-local"
          className="rounded-xl py-2 px-2 mr-2"
          required
        />
        <button
          onClick={() => {
            toast.success({ text: "Agendado!", icon: "✅" });
          }}
          name="intent"
          value="agenda_experiment"
          type="submit"
          className="active:bg-indigo-700 hover:bg-indigo-600 py-2 px-4 bg-indigo-500 rounded-xl text-gray-200"
        >
          Agendar correo
        </button>
      </Form>
      <div className="w-full">
        <div className="grid grid-cols-12 border py-1 px-4 bg-gray-400 w-full place-items-center">
          <h3 className="w-max col-span-2">Nombre</h3>
          <h3 className="w-max col-span-3">Siguiente</h3>
          <h3 className="w-max col-span-3">Data</h3>
          <h3 className="w-max col-span-2">Última</h3>
          <h3 className="w-max col-span-2">Prioridad</h3>
        </div>
        {jobs.map((job) => (
          <button
            // onClick={removeJob(job._id)}
            className="hover:bg-gray-200 grid grid-cols-12 px-4 py-1 bg-gray-100 items-center place-items-center"
            key={job}
          >
            <div className="col-span-2">{job.name}</div>
            <div className="col-span-3">
              {format(job.nextRunAt) === "no_runs_yet" ? (
                <span className="uppercase text-xs py-1 px-2 bg-gray-800 rounded-full text-white">
                  Ejecutado ✅
                </span>
              ) : (
                <span className="uppercase text-xs py-1 px-2 bg-green-500 rounded-full text-white w-max">
                  {format(job.nextRunAt)}
                </span>
              )}
            </div>
            {/* data */}
            <div className="text-xs col-span-3 overflow-auto">
              <span>{JSON.stringify(job.data, null, 1)}</span>
            </div>
            {/* ultima ejecución */}
            <div className="text-xs col-span-2 w-max">
              <span
                className={cn(
                  "uppercase text-xs py-1 px-2 bg-blue-600 rounded-full text-white",
                  {
                    "bg-gray-800": format(job.lastRunAt) === "no_runs_yet",
                  }
                )}
              >
                {format(job.lastRunAt)}
              </span>
            </div>
            <div className="text-xs col-span-2 w-max">
              <span
                className={cn(
                  "uppercase text-xs py-1 px-2 bg-green-600 rounded-full text-white",
                  {
                    "bg-orange-500": job.type !== "normal",
                  }
                )}
              >
                {job.type}
              </span>
            </div>
          </button>
        ))}
      </div>
    </article>
  );
}
