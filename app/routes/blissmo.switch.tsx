import { ActionFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import { Switch } from "~/components/common/Switch";
import {
  getMinutesFromString,
  getStringFromMinutes,
} from "~/components/forms/TimePicker";
import { DayTimesSelector, DayTuple } from "~/components/forms/TimesForm";

export const action = async ({ request }: ActionFunctionArgs) => {
  // const formData = await request.formData();
  return null;
};

const initialRange: [string, string] = ["06:00", "06:30"];
export default function Page() {
  const [actives, setActives] = useState({ lunes: true });
  const [week, setWeek] = useState<{ [x: string]: DayTuple }>({
    lunes: [initialRange],
  });

  const handleAddRange = (key: string) => {
    const last = week[key][week[key].length - 1][1];
    if (getMinutesFromString(last) > 1379) return; // just for the day
    const day: DayTuple = [
      ...week[key],
      [
        getStringFromMinutes(getMinutesFromString(last)),
        getStringFromMinutes(getMinutesFromString(last) + 30),
      ],
    ];
    setWeek((we) => ({ ...we, [key]: day }));
  };

  const handleSwitchChange = (key: string, checked: boolean) => {
    setActives((act) => ({ ...act, [key]: checked }));
  };

  const handleRemoveRange = (key: string, index: number) => {
    const newArray = [...week[key]];
    newArray.splice(index, 1);
    setWeek((w) => ({ ...w, [key]: newArray }));
  };

  const handleUpdate = (key: string, ranges: DayTuple) => {
    setWeek((w) => ({ ...w, [key]: ranges }));
  };

  return (
    <article className="flex flex-col gap-4 justify-center items-center h-screen overflow-auto">
      <h2>Time selector</h2>
      <section className="grid gap-2 grid-cols-4 px-4 items-center">
        <DayTimesSelector
          // Should this be controlled? Yes. ✅
          onRemoveRange={(index: number) => handleRemoveRange("lunes", index)}
          onUpdate={(ranges) => handleUpdate("lunes", ranges)}
          addRange={() => handleAddRange("lunes")}
          ranges={week.lunes}
          isActive={actives.lunes}
        >
          <h3 className="col-span-1">Lunes </h3>
          <Switch
            className="col-span-1"
            onChange={(value) => handleSwitchChange("lunes", value)}
          />
        </DayTimesSelector>
      </section>
    </article>
  );
}
