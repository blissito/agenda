import { json, LoaderFunctionArgs } from "@remix-run/node";
import { experimentCron } from "../jobs/experiment";
// @TODO: secure even more
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get("apiKey");
  const source = url.searchParams.get("source") || "PROD";
  if (apiKey !== "blissmos69")
    return json({ message: "Not Authorized t(*_*t)" }, { status: 401 });
  await experimentCron(source);
  console.info("Executed::CRON::experiment");
  return json({ message: "Job executed" }, { status: 200 });
};
