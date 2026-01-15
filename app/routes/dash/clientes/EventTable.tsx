// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import type { Service, Event } from "@prisma/client";
import { TableHeader } from "../dash.clientes";
import { FaRegClock } from "react-icons/fa6";
import { cn } from "~/utils/cn";
import { DropdownMenu } from "~/components/common/DropDownMenu";

export const EventTable = ({ events }: { events: Event[] }) => {
  return (
    <section className="max-w-4xl mx-auto">
      <TableHeader
        titles={[
          "fecha",
          "servicio",
          "encargado",
          ["puntos", "col-span-1"],
          "precio",
          "estatus",
          ["acciones", "col-span-1"],
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
    return new Date(event.start).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-12 px-8 py-4 bg-white border-b text-xs">
      <p className="flex items-center gap-2 col-span-2">
        <span>
          <FaRegClock />
        </span>
        {getEventDate()}
      </p>
      <p className="col-span-2 font-satoMedium">{event.service.name}</p>
      <p className="col-span-2">{event.service.employeeName || "s/n"}</p>
      <p className="col-span-1">{event.service.points}</p>
      <p className="col-span-1">{event.service.price}</p>
      {/* @TODO: crea un componente con las multiples tags */}
      <p className="col-span-3 flex gap-1 items-start">
        <span
          className={cn("px-1 py-[1px] rounded", {
            "bg-brand_blue/30": true,
            "bg-green-300": event.status === "ACTIVE",
            "bg-red-300": event.status === "CANCELED",
          })}
        >
          {event.status == "ACTIVE"
            ? "🔔 confirmada"
            : event.status === "CANCELED"
            ? "⛔️ cancelada"
            : "💤 atrasada"}
        </span>
        <span
          className={cn("px-1 py-[1px] rounded", {
            "bg-brand_blue/30": event.paid,
            "bg-blue-200": !event.paid,
          })}
        >
          {event.paid ? "💵 pagado" : "💸 sin pagar"}
        </span>
      </p>
      <div className="col-span-1">
        <DropdownMenu />
      </div>
    </div>
  );
};
