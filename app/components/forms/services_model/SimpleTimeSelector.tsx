import { motion } from "motion/react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { cn } from "~/utils/cn";
import { SelectInput } from "../SelectInput";

type Gap = [string, string];
type Gaps = Gap[];
type Week = {
  lunes?: Gaps;
  martes?: Gaps;
  miércoles?: Gaps;
  jueves?: Gaps;
  viernes?: Gaps;
  sábado?: Gaps;
  domingo?: Gaps;
};
type DayName = "lunes" | "martes" | "miércoles" | "jueves" | "viernes";

export const SimpleTimeSelector = () => {
  const [week, setWeek] = useState<Week>({});
  const handleDayChange = (dayName: DayName) => (gaps: Gaps) => {
    const w = { ...week };
    w[dayName] = gaps;
    setWeek(w);
  };

  const handleRemove = (dayName: DayName) => () => {
    const w = { ...week };
    delete w[dayName];
    setWeek(w);
  };

  // debug
  useEffect(() => {
    console.log("week: ", week);
  }, [week]);

  return (
    <article className="my-3 rounded-xl bg-white shadow py-6 px-6 max-w-2xl mx-auto">
      <h3>Actualiza los días y horarios en los que ofreces servicio</h3>
      <DaySelector
        onDeactivate={handleRemove("lunes")}
        dayName="Lunes"
        onChange={handleDayChange("lunes")}
      />
    </article>
  );
};

const DaySelector = ({
  dayName,
  onChange,
  onDeactivate,
}: {
  onChange?: (arg0: Gaps) => void;
  dayName: string;
  onDeactivate?: () => void;
}) => {
  const [isActive, setIsActive] = useState(false);
  const [gaps, setGaps] = useState<Gaps>([["09:00", "16:00"]]);
  const handleChange = (index: number, gap: [string, string]) => {
    let gps = [...gaps];
    if (Array.isArray(gap) && gap[0] && gap[1]) {
      gps.splice(index, 1, gap);
    } else {
      gps.splice(index, 1);
    }
    setGaps(gps);
    isActive && onChange?.(gps);
  };

  const handleActivation = (bool: boolean) => {
    if (bool) {
      setIsActive(bool);
      onChange?.(gaps);
    } else {
      onDeactivate?.();
    }
  };

  // debug
  useEffect(() => {
    // console.log("Gaps: ", gaps);
  }, [gaps]);

  return (
    <section className="flex items-center justify-evenly py-2">
      <h4>{dayName}</h4>
      <SimpleSwitch value={isActive} onChange={handleActivation} />
      <main className="">
        {gaps.map((gap, i) => (
          <Gap
            onChange={(newGap) => handleChange(i, newGap)}
            gap={gap}
            key={i}
          />
        ))}
      </main>
      <button>+ Agregar</button>
    </section>
  );
};

const generateHours = () => {
  const hrs = Array.from({ length: 23 }).map((_, i) => {
    const h = i < 10 ? `0${i}` : i; // @todo half hours?
    return {
      value: `${h}:00`,
      title: `${h}:00`,
    };
  });
  return hrs;
};

const Gap = ({
  onChange,
  gap,
  onError,
}: {
  onError?: () => void;
  gap: [string, string];
  onChange?: (arg0: Gap) => void;
}) => {
  const [range, setRange] = useState<Gap>(["09:00", "16:00"]);
  const [error, setError] = useState<string | null>(null);
  const options = generateHours();
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);

  const isValid = (pair: [string, string]) => {
    timeout.current && clearTimeout(timeout.current);
    let err = null;
    const n1 = Number(pair[0].split(":")[0]);
    const n2 = Number(pair[1].split(":")[0]);
    // console.log("Validating", n1, n2, n1 < n2);
    const valid = n1 < n2;
    if (!valid) {
      err = "La hora final, no puede ser menor.";
    }
    setError(err);
    timeout.current = setTimeout(() => setError(null), 3000);
    return n1 < n2;
  };

  const handleUpdate = (update: Gap) => {
    if (isValid(update)) {
      setRange(update);
      onChange?.(update);
    }
  };

  const handleChange =
    (index: number) => (ev: ChangeEvent<HTMLSelectElement>) => {
      const val = ev.currentTarget.value;
      const update = [...range] as [string, string];
      update.splice(index, 1, val);
      handleUpdate(update);
    };

  return (
    <section>
      <div className="flex items-center gap-2">
        <span>De</span>
        <SelectInput
          onChange={handleChange(0)}
          value={range[0]}
          options={options}
        />
        <span>a</span>
        <SelectInput
          onChange={handleChange(1)}
          value={range[1]}
          options={options}
        />
      </div>
      <p className="text-red-500 text-xs">{error}</p>
    </section>
  );
};

export const SimpleSwitch = ({
  isDisabled,
  name,
  value,
  onChange,
}: {
  isDisabled?: boolean;
  name?: string;
  value?: boolean;
  onChange?: (arg0: boolean) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOn, setOn] = useState(false);

  const onClick = () => {
    setOn((o) => {
      inputRef.current!.checked = !o;
      onChange?.(!o);
      return !o;
    });
  };

  useEffect(() => {
    setOn(value);
  }, [value]);

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      className="flex justify-between items-center"
    >
      <div
        className={cn(
          "flex bg-gray-100 w-7 p-1 rounded-full",

          {
            "justify-end bg-brand_blue/30 shadow": isOn,
          }
        )}
      >
        <motion.div
          transition={{ type: "spring" }}
          layout
          className={cn("bg-gray-300 h-3 w-3 rounded-full", {
            "bg-brand_blue ": isOn,
          })}
        ></motion.div>
      </div>
      <input
        name={name}
        ref={inputRef}
        className="hidden"
        disabled={isDisabled}
        type="checkbox"
        // {...register?.(name, registerOptions)}
      />
    </button>
  );
};
