import { ActionFunctionArgs } from "@remix-run/node";
import { Switch } from "~/components/common/Switch";
import { DayTimesSelector } from "~/components/forms/TimesForm";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  console.log("DATA:", formData.get("perro"));
};

export default function Page() {
  return (
    <article className="flex flex-col gap-4 justify-center items-center h-screen">
      <h2>Time selector</h2>
      <DayTimesSelector ranges={[["10:00", "12:00"]]} isActive>
        <Switch />
      </DayTimesSelector>
    </article>
  );
}
