import { Agenda } from "@hokify/agenda";
import { sendExperiment } from "~/utils/emails/sendExperiment";

const mongoConnectionString =
  "mongodb+srv://borrame_secure:o9FQXFbKI8TNWhyV@cluster0.ahniito.mongodb.net/jobs?retryWrites=true&w=majority&appName=Cluster0";

const agenda = new Agenda({
  db: { address: mongoConnectionString },
});

agenda.define(
  "send_experiment",
  async (job) => {
    const { emails, when } = job.attrs.data;
    await sendExperiment(emails, { when });
  },
  { priority: "normal", concurrency: 10 }
);

export const scheduleMail = async ({
  emails,
  when,
  template = "send_experiment",
}: {
  when?: string | Date;
  emails: string[];
  template?: "send_experiment" | string;
  data?: unknown;
}) => {
  await agenda.start();
  console.log("Agendando envío de::", template);
  const r = when
    ? await agenda.schedule(when, template, { emails, when })
    : await agenda.now("send_experiment");

  console.log(
    "AGENDADO::",
    r.attrs,
    new Date(r.attrs.nextRunAt).toLocaleString("es-MX", {
      hour: "numeric",
      year: "numeric",
      month: "short",
      day: "numeric",
      minute: "numeric",
    })
  );
};

// (async function(){
//     await agenda.start()
//     await agenda.schedule
// })

// export const getAllJobs = () => {
//   return agenda.start().then(() => {
//     return agenda.jobs({ lastRunAt: { $exists: true } });
//   });
// };

export default agenda;
