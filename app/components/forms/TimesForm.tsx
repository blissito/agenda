import { Form, useFetcher } from "@remix-run/react";
import { Switch } from "./Switch";
import { PrimaryButton } from "../common/primaryButton";
import { useForm } from "react-hook-form";
import { SLUGS } from "~/routes/signup.$stepSlug";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
// @TODO: improve animation presence
import {
  getMinutesFromString,
  getStringFromMinutes,
  TimePicker,
} from "./TimePicker";
import { nanoid } from "nanoid";
import { en } from "@faker-js/faker";

export type DayTuple = [string, string][];
export type WeekTuples = {
  lunes?: DayTuple;
  martes?: DayTuple;
  miércoles?: DayTuple;
  jueves?: DayTuple;
  viernes?: DayTuple;
  sábado?: DayTuple;
  domingo?: DayTuple;
};

const MAX_RANGES_PERMITED = 6;
const ENTIRE_WEEK = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];
const initialValues: WeekTuples = {
  lunes: [
    ["09:00", "16:00"],
    // ["17:00", "18:00"],
  ],
  // martes: [
  //   ["10:00", "16:00"],
  //   ["18:00", "22:00"],
  // ],
  // miércoles: [
  //   ["10:00", "14:00"],
  //   ["18:00", "20:00"],
  // ],
  // jueves: [
  //   ["10:00", "16:00"],
  //   ["18:00", "22:00"],
  // ],
  // viernes: [
  //   ["10:00", "16:00"],
  //   ["18:00", "22:00"],
  // ],
};

const RANGE_TEMPLATE = ["09:00", "14:00"];
export const ERROR_MESSAGE = "Debes seleccionar al menos un día";

export const TimesForm = () => {
  const fetcher = useFetcher();
  const [data, setData] = useState<WeekTuples>(initialValues);
  const {
    clearErrors,
    setValue,
    getValues,
    setError,
    formState: { isValid, errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      weekDays: Object.keys(initialValues),
    },
  });

  const onSubmit = () => {
    // @TODO: validate?
    fetcher.submit(
      // tipo-de-negocio
      { intent: SLUGS[2], data: JSON.stringify(data) },
      { method: "post" }
    );
  };

  const handleSwitchChange = (node: HTMLInputElement) => {
    let action: "adding" | "removing";
    clearErrors();
    const values = getValues()[node.name];
    if (node.checked) {
      action = "adding";
      values.push(node.value);
    } else {
      action = "removing";
      values.splice(
        values.findIndex((v: string) => v === node.value),
        1
      );
    }

    setValue(node.name, [...new Set(values)], { shouldValidate: true });
    if (!values.length) {
      setError(node.name, { message: ERROR_MESSAGE });
    }
    // copy ranges for new active day
    toggleRange(action, node.id);
  };

  const toggleRange = (action: "adding" | "removing", dayString: string) => {
    if (action === "adding") {
      const dayValues = Object.values(data);
      const copy = dayValues.length
        ? dayValues[dayValues.length - 1]
        : [RANGE_TEMPLATE];
      setData((data) => ({ ...data, [dayString]: copy }));
    } else if (action === "removing") {
      const d = { ...data };
      delete d[dayString];
      setData(d);
    }
  };

  const addRange = (dayString: string) => {
    if (data[dayString]?.length) {
      // if (data[dayString].length > 5) return console.error("ONLY 6 PERMITED");
      setData((d) => {
        const dd = JSON.parse(JSON.stringify(d));
        const lastRange = dd[dayString].pop();
        const nextH = getStringFromMinutes(
          getMinutesFromString(lastRange[1]) + 30
        );

        if (!Array.isArray(lastRange)) return d;
        const nextRange = [
          nextH,
          // getStringFromMinutes(getMinutesFromString(lastRange[1])),
          getStringFromMinutes(getMinutesFromString(lastRange[1]) + 60),
        ];
        return {
          ...d,
          [dayString]: [...d[dayString], nextRange],
        };
      });
    }
  };

  const removeRange = (day: string, index: number) => {
    const arr = [...data[day]];
    arr.splice(index, 1);
    // console.log("REMOVED? ", r);
    setData((d) => ({ ...d, [day]: arr }));
  };

  const handleUpdate = (day: string, ranges: string[][]) => {
    // console.log("UPDATE", day, ranges);
    setData((d) => ({ ...d, [day]: ranges }));
  };

  useEffect(() => {
    // console.log("DATA: ", data);
  }, [data]);

  const isDisabled = !isValid || (errors.weekDays ? true : false);

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className={twMerge(
        "h-full pt-20 px-2  max-w-xl mx-auto",
        "flex flex-col justify-evenly h-full gap-5"
      )}
    >
      {/* Switches */}
      {ENTIRE_WEEK.map((dayString: string) => (
        <DayTimesSelector
          key={dayString}
          ranges={data[dayString]}
          addRange={() => addRange(dayString)}
          removeRange={(index) => removeRange(dayString, index)}
          updateRanges={(ranges) => handleUpdate(dayString, ranges)}
          // onRange={(range) => handleRange(dayString, range)}
          isActive={getValues().weekDays.includes(dayString)}
          id={dayString}
        >
          <Switch
            defaultChecked={getValues().weekDays.includes(dayString)}
            name="weekDays"
            value={dayString}
            onChange={handleSwitchChange}
          />
        </DayTimesSelector>
      ))}

      <div className="mt-auto">
        {" "}
        <PrimaryButton
          className="w-full mt-auto"
          isDisabled={isDisabled}
          type="submit"
        >
          Continuar
        </PrimaryButton>
        <p className="mb-10 ml-2 h-1 text-red-500 text-xs">
          {errors.weekDays?.message}
        </p>
      </div>
    </Form>
  );
};

const DayTimesSelector = ({
  children,
  addRange,
  removeRange,
  isActive,
  ranges = [],
  updateRanges,
}: {
  id: string;
  ranges: DayTuple;
  addRange?: () => void;
  removeRange?: (arg0: number) => void;
  updateRanges?: (ranges: string[][]) => void;
  range?: string[];
  isActive?: boolean;
  children?: ReactNode;
}) => {
  const handleChange = (index: number, range: string[]) => {
    const arr = [...ranges];
    arr[index] = range;
    updateRanges?.(arr);
  };

  // const r = [...ranges];
  // const lastRange = r.pop();
  // console.log("ranges?: ", lastRange, ranges);
  // const lastHourMins = getMinutesFromString(lastRange?.[1]);

  // console.log("LAst Hot", lastHourMins, getStringFromMinutes(lastHourMins));

  return (
    <div>
      {children}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ y: -10, opacity: 0 }}
          className={twMerge(
            "gap-4",
            isActive && "grid",
            "text-brand_gray mt-2"
          )}
        >
          {ranges.map((range, index) => (
            <div className="flex gap-2" key={nanoid()}>
              <RangeTimePicker
                index={index}
                onChange={(range) => handleChange(index, range)}
                startTime={range[0]}
                endTime={range[1]}
                onDelete={() => removeRange?.(index)}
              />
              {index === 0 &&
                Number(ranges[ranges.length - 1][1].split(":")[0]) < 23 && (
                  <button
                    type="button"
                    onClick={addRange}
                    className={twMerge(
                      // "col-start-2 row-start-1",
                      "active:text-brand_gray text-brand_gray/70 hover:text-brand_gray/90 lg:text-left"
                    )}
                  >
                    + Agregar
                  </button>
                )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export const RangeTimePicker = ({
  index,
  startTime,
  endTime,
  onChange,
  onDelete,
}: {
  index?: number;
  onDelete?: () => void;
  startTime: string;
  endTime: string;
  onChange?: (arg0: string[]) => void;
}) => {
  // console.log("???WTF", startTime, endTime);
  const changeStartTime = (time: string) => {
    onChange?.([time, endTime]);
  };

  const changeEndTime = (time: string) => {
    // console.log("ora?", time, [startTime, time]);
    onChange?.([startTime, time]);
  };

  // console.log("St end: ", startTime, endTime);
  const getTime = (startTime: string) => {
    // return "12:00";
    const mins = getMinutesFromString(startTime);
    return getStringFromMinutes(mins);
  };

  return (
    <div>
      <div className="relative flex items-center gap-3">
        <span>De</span>
        <TimePicker startTime={startTime} onChange={changeStartTime} all />
        <span>a</span>
        <TimePicker
          selected={endTime}
          startTime={getTime(startTime)}
          onChange={changeEndTime}
        />
        {index !== 0 && (
          <button
            onClick={onDelete}
            type="button"
            className=" active:text-red-500 right-0 top-[28%] text-red-400 hover:text-red-500 transition-all"
          >
            <FaRegTrashCan />
          </button>
        )}
      </div>
    </div>
  );
};