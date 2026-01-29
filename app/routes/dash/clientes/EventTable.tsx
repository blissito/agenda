// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import type { Service, Event } from "@prisma/client";
import { TableHeader } from "../dash.clientes";
import { FaRegClock } from "react-icons/fa6";
import { DropdownMenu } from "~/components/common/DropDownMenu";

// Status Tag component matching Figma design
const StatusTag = ({
  variant,
}: {
  variant: "confirmed" | "canceled" | "paid" | "unpaid";
}) => {
  const styles = {
    confirmed: {
      bg: "bg-[#effbd0]",
      text: "text-[#4f7222]",
      label: "🔔 Confirmada",
    },
    canceled: {
      bg: "bg-[#f9e7eb]",
      text: "text-[#ab4265]",
      label: "🚫 Cancelada",
    },
    paid: {
      bg: "bg-[#d5faf1]",
      text: "text-[#2a645f]",
      label: "💸 Pagada",
    },
    unpaid: {
      bg: "bg-[#eef9fd]",
      text: "text-[#276297]",
      label: "🎫 Sin pagar",
    },
  };

  const style = styles[variant];

  return (
    <span
      className={`${style.bg} ${style.text} inline-flex items-center justify-center px-[6px] py-[3px] rounded text-[10px] font-satoMedium text-center whitespace-nowrap`}
    >
      {style.label}
    </span>
  );
};

export const EventTable = ({ events }: { events: Event[] }) => {
  return (
    <section className="w-full">
      <TableHeader
        titles={[
          "fecha",
          "servicio",
          "encargado",
          ["puntos", "col-span-1"],
          ["precio", "col-span-1"],
          ["estatus", "col-span-3 pl-4"],
          ["", "col-span-1"], // No header for actions column per Figma
        ]}
      />

      {events.map((event) => (
        <EventRow event={event} key={event.id} />
      ))}
    </section>
  );
};

export const EventRow = ({
  event,
}: {
  event: Event & { service: Service };
}) => {
  const getEventDate = () => {
    const date = new Date(event.start);
    const day = date.getDate();
    const month = date.toLocaleDateString("es-MX", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getEventTime = () => {
    const date = new Date(event.start);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "pm" : "am";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-12 px-6 py-4 bg-white border-b border-[#f2f2f2]">
      <div className="flex items-center gap-2 col-span-2 pl-0">
        <span className="text-[#8391a1]">
          <FaRegClock />
        </span>
        <div className="flex flex-col">
          <span className="text-[12px] font-satoMedium text-[#4b5563]">{getEventDate()}</span>
          <span className="text-[10px] font-satoMedium text-[#8391a1]">{getEventTime()}</span>
        </div>
      </div>
      <p className="col-span-2 font-satoBold text-[12px] text-[#11151a] flex items-center">{event.service.name}</p>
      <p className="col-span-2 font-satoMedium text-[12px] text-[#4b5563] flex items-center">{event.service.employeeName || "s/n"}</p>
      <p className="col-span-1 font-satoMedium text-[12px] text-[#4b5563] flex items-center">{event.service.points}</p>
      <p className="col-span-1 font-satoMedium text-[12px] text-[#4b5563] flex items-center">{formatPrice(event.service.price)}</p>
      <div className="col-span-3 flex gap-2 items-center pl-4">
        <StatusTag
          variant={event.status === "ACTIVE" ? "confirmed" : "canceled"}
        />
        <StatusTag
          variant={event.paid ? "paid" : "unpaid"}
        />
      </div>
      <div className="col-span-1 flex items-center justify-end">
        <DropdownMenu />
      </div>
    </div>
  );
};
