import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { cn } from "~/utils/cn";
import { SelectInput } from "../SelectInput";
import { FaRegTrashAlt } from "react-icons/fa";
import { PrimaryButton } from "~/components/common/primaryButton";

type Gap = [string, string];
type Gaps = Gap[];
export type Week = {
  lunes?: Gaps;
  martes?: Gaps;
  miércoles?: Gaps;
  jueves?: Gaps;
  viernes?: Gaps;
  sábado?: Gaps;
  domingo?: Gaps;
};
type DayName = "lunes" | "martes" | "miércoles" | "jueves" | "viernes";

export const SimpleTimeSelector = ({
  onSubmit,
  isLoading,
  defaultValue,
}: {
  isLoading?: boolean;
  defaultValue?: Week;
  onSubmit: (arg0: Week) => void;
}) => {
  const [week, setWeek] = useState<Week>(defaultValue || {});
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
    // console.log("week: ", week);
  }, [week]);

  const handleSubmit = () => {
    onSubmit?.(week);
    // @todo if empty delete from service?
  };

  return (
    <article className="my-3 rounded-xl bg-white shadow py-6 px-6 max-w-2xl mx-auto flex flex-col">
      <h3>Actualiza los días y horarios en los que ofreces servicio</h3>
      <section>
        {[
          "lunes",
          "martes",
          "miércoles",
          "jueves",
          "viernes",
          "sábado",
          "domingo",
        ].map((dayName) => (
          <DaySelector
            defaultValue={week[dayName]}
            key={dayName}
            onDeactivate={handleRemove(dayName)}
            dayName={dayName}
            onChange={handleDayChange(dayName)}
          />
        ))}
      </section>
      <nav className="flex gap-4 ml-auto mt-8">
        <PrimaryButton as="Link" to="/dash/servicios" mode="cancel">
          cancelar
        </PrimaryButton>
        <PrimaryButton isLoading={isLoading} onClick={handleSubmit}>
          {" "}
          guardar
        </PrimaryButton>
      </nav>
    </article>
  );
};

const DaySelector = ({
  dayName,
  onChange,
  onDeactivate,
  defaultValue,
}: {
  defaultValue?: Gaps;
  onChange?: (arg0: Gaps) => void;
  dayName: string;
  onDeactivate?: () => void;
}) => {
  const [isActive, setIsActive] = useState(!!defaultValue);
  const [gaps, setGaps] = useState<Gaps>(defaultValue || [["09:00", "16:00"]]);
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
      onChange?.(gaps);
    } else {
      onDeactivate?.();
    }
    setIsActive(bool);
  };

  // debug
  useEffect(() => {
    // console.log("Gaps: ", gaps);
  }, [gaps]);

  const handleAddGap = () => {
    const gs = [...gaps];
    gs.push(["09:00", "17:00"]);
    setGaps(gs);
    onChange?.(gs);
  };

  const handleRemove = (index: number) => {
    const gs = [...gaps];
    gs.splice(index, 1);
    setGaps(gs);
    onChange?.(gs);
  };

  return (
    <section className="flex items-start gap-8 py-4">
      <header className="flex gap-4 py-3">
        <h4 className="capitalize w-20">{dayName}</h4>
        <SimpleSwitch value={isActive} onChange={handleActivation} />
      </header>
      {isActive && (
        <main className="flex items-start">
          <section>
            <AnimatePresence>
              {gaps.map((gap, i) => (
                <Gap
                  index={i}
                  onRemove={i === 0 ? undefined : () => handleRemove(i)}
                  onChange={(newGap) => handleChange(i, newGap)}
                  gap={gap}
                  key={i}
                />
              ))}
            </AnimatePresence>
          </section>

          <button
            disabled={!isActive}
            onClick={handleAddGap}
            className={cn(
              "text-gray-500 enabled:hover:text-gray-600 p-3",
              "disabled:text-gray-300"
            )}
          >
            + Agregar
          </button>
        </main>
      )}
      {!isActive && <span className="text-gray-400 py-3">Cerrado</span>}
    </section>
  );
};

const generateHours = () => {
  const hrs = Array.from({ length: 24 }).map((_, i) => {
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
  index,
  onRemove,
}: {
  gap?: Gap;
  index: number;
  onRemove?: () => void;
  onError?: () => void;
  onChange?: (arg0: Gap) => void;
}) => {
  const [range, setRange] = useState<Gap>(gap || ["09:00", "16:00"]);
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
    <motion.section
      transition={{ delay: index * 0.05 }}
      initial={{ opacity: 0, filter: "blur(4px)", y: -10 }}
      exit={{ opacity: 0, filter: "blur(4px)", x: -10 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
    >
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
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-red-500 text-xs p-2 hover:scale-105 transition-all"
          >
            <FaRegTrashAlt />
          </button>
        )}
      </div>
      <p className="text-red-500 text-xs">{error}</p>
    </motion.section>
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
