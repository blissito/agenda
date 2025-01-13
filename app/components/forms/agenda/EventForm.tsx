import type { Customer, Event } from "@prisma/client";
import { Form, useFetcher } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { BasicInput } from "../BasicInput";
import { SelectInput } from "../SelectInput";
import { Switch } from "~/components/common/Switch";
import { DateInput } from "../DateInput";
import { useEffect, useState, type ChangeEvent } from "react";
import { PrimaryButton } from "~/components/common/primaryButton";
import { newEventSchema } from "~/utils/zod_schemas";
import { CustomersComboBox } from "../CustomersComboBox";
import { ServiceSelect } from "../ServiceSelect";
import { EmployeeSelect } from "../EmployeeSelect";

const formatDate = (d: Date | string) =>
  new Date(d).toISOString().substring(0, 10);

const formatHour = (d: Date | string) =>
  new Date(d)
    .toLocaleDateString("es-MX", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    })
    .split(",")[1]
    .trim();

export const EventForm = ({
  defaultValues,
  onValid,
  onCancel,
  onNewClientClick,
  customers,
}: {
  customers: Customer[];
  onNewClientClick: () => void;
  onCancel?: () => void;
  onValid?: (arg0: { isValid: boolean; values: Partial<Event> }) => void;
  defaultValues: Partial<Event>;
  ownerName?: string;
}) => {
  const fetcher = useFetcher();
  const oneMoreHour = new Date(defaultValues.start as Date);
  oneMoreHour.setHours(oneMoreHour.getHours() + 1);

  const {
    register,
    formState: { isValid, errors },
    getValues,
    setValue,
    setError,
    control,
    handleSubmit,
  } = useForm({
    defaultValues: {
      customerId: "",
      start: formatDate(defaultValues.start as Date),
      startHour: formatHour(defaultValues.start as Date),
      endHour: formatHour(oneMoreHour),
      ...defaultValues,
    },
  });

  useEffect(() => {
    onValid?.({ isValid, values: { ...getValues(), duration } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [control]);

  // duration calculation 🧠
  const [duration, setDuration] = useState(60);
  const handleHoursChange = () => {
    const v = getValues();
    const sh = Number(v.startHour.split(":")[0]),
      sm = Number(v.startHour.split(":")[1]),
      eh = Number(v.endHour.split(":")[0]),
      em = Number(v.endHour.split(":")[1]);
    const one = new Date(),
      dos = new Date();
    one.setHours(sh);
    one.setMinutes(sm);
    dos.setHours(eh);
    dos.setMinutes(em);
    const du = (dos.getTime() - one.getTime()) / 1000 / 60; // mins
    setDuration(du);
    setValue("startHour", v.startHour);
  };

  const parseData = (values: Partial<Event>) => {
    const start = new Date(values.start + "T00:00:00");
    start.setDate(start.getDate()); // why?
    start.setHours(values.startHour.split(":")[0]);
    start.setMinutes(values.startHour.split(":")[1]);

    const end = new Date(values.start + "T00:00:00");
    end.setHours(values.endHour.split(":")[0]);
    end.setMinutes(values.endHour.split(":")[1]);

    if (start > end) {
      setError("startHour", {
        message: "La fecha de inicio debe ser menor a la de finalización 🔁",
      });
      return;
    }

    const payload = {
      ...values,
      duration,
      start,
      end,
    };
    const r = newEventSchema.safeParse(payload);
    if (!r.success) {
      console.error("PARSE_ERROR: ", r.error);
      r.error.issues.forEach((issue) => {
        setError(issue.path[0], { message: issue.message });
      });
      return;
    }
    return r.data;
  };

  const onSubmit = (v: Partial<Event>) => {
    const validData = parseData(v);
    if (!validData) return console.error("EEROR_ON_VALIDATION", validData);
    return;
    fetcher.submit(
      { intent: "add_event", data: JSON.stringify(validData) },
      { method: "POST", action: "/dash/agenda" }
    );
    onCancel?.();
  };

  const handleCustomerSelection = (selectedCustomer: Customer | null) => {
    if (!selectedCustomer) {
      setValue("customerId", "", { shouldValidate: true });
    } else {
      setValue("customerId", selectedCustomer.id, { shouldValidate: true });
    }
  };

  const isLoading = fetcher.state !== "idle";

  const startHour = useWatch({ control, name: "startHour" });
  const endHour = useWatch({ control, name: "endHour" });

  useEffect(() => {
    handleHoursChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startHour, endHour]);

  const registerVirtualFields = () => {
    // virtual fields
    register("customerId", { required: true });
    register("serviceId", { required: true });
  };

  useEffect(() => {
    registerVirtualFields();
  }, []);

  const handleServiceSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setValue("serviceId", event.currentTarget.value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  console.log(getValues());

  return (
    <Form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      {/* @TODO: create a combobox */}
      <CustomersComboBox
        onSelect={handleCustomerSelection}
        customers={customers}
        onNewClientClick={onNewClientClick}
      />
      <ServiceSelect onChange={handleServiceSelect} />
      <EmployeeSelect />

      <p className="font-bold">Fecha y hora</p>
      <div className="flex items-center">
        <DateInput name="start" register={register} />
        <span className="px-4">De</span>
        <DateInput
          type="time"
          name="startHour"
          register={register}
          onChange={handleHoursChange}
          error={errors.startHour}
          registerOptions={{ required: false }}
        />
        <span className="py-5 px-4">a</span>
        <DateInput
          name="endHour"
          register={register}
          type="time"
          onChange={handleHoursChange}
          error={errors.startHour}
          registerOptions={{ required: false }}
        />
      </div>
      {errors["startHour"] ? (
        <p className="text-red-500">{errors.startHour.message}</p>
      ) : (
        <p className="mb-6">
          Duración:{" "}
          <strong className="font-sans font-bold"> {duration}m</strong>
        </p>
      )}
      <BasicInput
        label="Notas"
        as="textarea"
        name="notes"
        register={register}
        className="min-w-[170px]"
        placeholder="Agrega una nota o comentario"
        registerOptions={{ required: false }}
      />
      <hr className="w-[90%] self-center border-brand_pale mt-2 mb-6" />
      <Switch
        label="Pagado"
        name="paid"
        register={register}
        registerOptions={{ required: false }}
      />
      <SelectInput
        register={register}
        registerOptions={{ required: false }}
        name="payment_method"
        defaultValue="cash"
        label="Forma de pago"
        options={[
          { value: "card", title: "Tarjeta" },
          {
            value: "cash",
            title: "Efectivo",
          },
        ]}
      />
      <hr className="mt-4 border-none" />
      <nav className="absolute bottom-0 flex justify-end px-20 py-4 w-full gap-4 bg-white">
        <PrimaryButton
          type="button"
          isDisabled={isLoading}
          onClick={onCancel}
          mode="cancel"
        >
          Cancelar
        </PrimaryButton>
        <PrimaryButton isLoading={isLoading} isDisabled={!isValid}>
          Guardar
        </PrimaryButton>
      </nav>
    </Form>
  );
};

const IconAndText = ({
  text,
  icon,
}: {
  text?: string | null;
  icon?: string;
}) => (
  <div className="flex gap-2">
    <img src={icon} alt="icon" width="18px" />
    <span className="text-brand_gray text-xs">{text}</span>
  </div>
);
