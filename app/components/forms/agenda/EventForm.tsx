import { Event } from "@prisma/client";
import { Form } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { BasicInput } from "../BasicInput";
import { SelectInput } from "../SelectInput";
import { Switch } from "~/components/common/Switch";
import { RiUserSearchLine } from "react-icons/ri";
import { DateInput } from "../DateInput";
import { useEffect, useState } from "react";

export const EventForm = ({
  defaultValues,
  onValid,
}: {
  onValid?: (arg0: boolean) => void;
  defaultValues: Partial<Event>;
  ownerName?: string;
}) => {
  const d = new Date(defaultValues.start);
  let oneMoreHour = new Date(d);
  oneMoreHour.setHours(oneMoreHour.getHours() + 1);
  // console.log("D: ", d);
  const {
    register,
    formState: { isValid },
    getValues,
  } = useForm({
    defaultValues: {
      ...defaultValues,
      start: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
      startHours: d
        .toLocaleDateString("es-MX", {
          hour: "numeric",
          minute: "numeric",
          hour12: false,
        })
        .split(",")[1]
        .trim(),
      endHours: oneMoreHour
        .toLocaleDateString("es-MX", {
          hour: "numeric",
          minute: "numeric",
          hour12: false,
        })
        .split(",")[1]
        .trim(),
    },
  });

  useEffect(() => {
    onValid?.(isValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid]);

  const [duration, setDuration] = useState(60);
  const handleHoursChange = (h: number, m: number) => {
    const v = getValues();
    const sh = Number(v.startHours.split(":")[0]),
      sm = Number(v.startHours.split(":")[1]),
      eh = Number(v.endHours.split(":")[0]),
      em = Number(v.endHours.split(":")[1]);
    const one = new Date(),
      dos = new Date();
    one.setHours(sh);
    one.setMinutes(sm);
    dos.setHours(eh);
    dos.setMinutes(em);
    const du = (dos.getTime() - one.getTime()) / 1000 / 60; // mins
    setDuration(du);
  };

  return (
    <Form className="flex flex-col">
      {/* @TODO: create a combobox */}
      <BasicInput
        label="Cliente"
        icon={<RiUserSearchLine />}
        name="customer"
        placeholder="Buscar por correo"
        registerOptions={{ required: false }}
      />
      <SelectInput
        placeholder="Selecciona un servicio"
        isDisabled
        label="Servicio"
        name="service"
        registerOptions={{ required: false }}
      />
      <SelectInput
        isDisabled
        icon={<img src="/agenda_icons/id.svg" alt="icon" />}
        label="Profesional"
        name="employee"
        registerOptions={{ required: false }}
      />
      <p className="font-bold">Fecha y hora</p>
      <div className="flex items-center">
        <DateInput name="start" register={register} />
        <span className="px-4">De</span>
        <DateInput
          // onChange={(h, m) => console.log("El value arriba:", h, m)}
          type="time"
          name="startHours"
          register={register}
          onChange={handleHoursChange}
        />
        <span className="py-5 px-4">a</span>
        <DateInput
          name="endHours"
          register={register}
          type="time"
          onChange={handleHoursChange}
        />
      </div>
      <p className="mb-6">Duración: {duration}m</p>
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
        name="paymode"
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

{
  /* <hr className="w-[90%] self-center border-brand_pale mt-2 mb-6" /> */
}
//
{
  /* <IconAndText
text={event.customer?.comments || "Sin comentarios"}
icon="/agenda_icons/note.svg"
/> */
}
