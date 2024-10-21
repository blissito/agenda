import { Event } from "@prisma/client";
import { Form } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { BasicInput } from "../BasicInput";
import { SelectInput } from "../SelectInput";
import { CiCalendar } from "react-icons/ci";
import { addMinutesToDate } from "~/components/dash/agenda/agendaUtils";
import { Switch } from "~/components/common/Switch";

export const EventForm = ({
  event = {},
  ownerName,
}: {
  event: Event;
  ownerName?: string;
}) => {
  const {
    formState: { isValid },
    register,
    handleSubmit,
  } = useForm();

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("es-MX", {
      month: "long",
      day: "numeric",
    });

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString("es-MX", {
      hour: "numeric",
      minute: "numeric",
    });

  const findEndTime = (event: Event) => {
    const end = addMinutesToDate(event.start, event.duration);
    return end?.toLocaleTimeString("es-MX", {
      hour: "numeric",
      minute: "numeric",
    });
  };

  return (
    <Form className="flex flex-col">
      <hr className="w-[90%] self-center border-brand_pale mb-6" />
      <section className="flex flex-wrap gap-x-20 gap-y-4">
        <IconAndText
          text={event.customer.tel}
          icon="/agenda_icons/cellphone.svg"
        />
        <IconAndText
          text={event.customer.email}
          icon="/agenda_icons/mail.svg"
        />
        <IconAndText
          text={event.customer.comments || "Sin comentarios"}
          icon="/agenda_icons/note.svg"
        />
      </section>
      <hr className="w-[90%] self-center border-brand_pale my-6" />
      <SelectInput
        isDisabled
        icon={<img src="/agenda_icons/id.svg" alt="icon" width="32px" />}
        label="Profesional"
        name="profesional"
        placeholder={ownerName}
        defaultValue={ownerName}
      />
      <p className="font-bold">Fecha y hora</p>
      <div className="flex items-start">
        <BasicInput
          icon={
            <span className="text-xl text-brand_gray absolute top-[26%] left-4 ">
              <CiCalendar />
            </span>
          }
          placeholder={formatDate(event.start)}
          name="start"
          register={register}
          className="min-w-[170px]"
        />
        <span className="py-5 px-4">De</span>
        <select
          className="rounded-lg border-gray-200 h-12 w-full text-brand_gray my-2"
          disabled
          name="time"
          defaultValue={""}
        >
          <option value="">{formatTime(event.start)}</option>
        </select>
        <span className="py-5 px-4">a</span>
        <select
          className="rounded-lg border-gray-200 h-12 w-full text-brand_gray my-2"
          disabled
          name="time"
          defaultValue={""}
        >
          <option value="">{findEndTime(event)}</option>
        </select>
      </div>
      <BasicInput
        label="Notas"
        as="textarea"
        name="notes"
        register={register}
        className="min-w-[170px]"
        placeholder="Agrega una nota o comentario"
      />
      <hr className="w-[90%] self-center border-brand_pale mt-2 mb-6" />
      <Switch label="Pagado" name="paid" />
      <div className="my-6">
        <label htmlFor="payment">Forma de pago</label>
        <select
          className="rounded-lg border-gray-200 h-12 w-full text-brand_gray my-2"
          disabled
          name="payment_method"
          defaultValue={""}
        >
          <option value="">Efectivo</option>
        </select>
      </div>
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
