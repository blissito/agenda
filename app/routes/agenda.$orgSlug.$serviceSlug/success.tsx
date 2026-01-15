import type { Customer, Event as PrismaEvent, Org, Service } from "@prisma/client";
import { useEffect, useState } from "react";
import { EmojiConfetti } from "~/components/common/EmojiConfetti";
import { PrimaryButton } from "~/components/common/primaryButton";
import { ServiceList } from "~/components/forms/agenda/DateAndTimePicker";

type EventWithRelations = PrismaEvent & {
  customer?: Customer | null;
  service?: (Service & { org: Org }) | null;
};

export const Success = ({
  event,
  service,
  onFinish,
  org,
}: {
  onFinish: () => void;
  org: Org;
  service: Service;
  event?: EventWithRelations;
}) => {
  const [on, set] = useState(true);
  useEffect(() => {
    setTimeout(() => set(false), 4000);
  }, []);
  const getCTALink = () => {
    return `/agenda/${org.slug}/${service.slug}`;
  };

  return (
    <div className="flex h-screen flex-col items-center text-brand_gray bg-[#f8f8f8] px-2 md:py-20">
      <img
        alt="denik markwater"
        className="absolute right-0 bottom-0 z-0 w-[45%] lg:w-auto"
        src="/images/denik-markwater.png"
      />
      <div className="relative">
        <img
          className="w-[240px] h-[240px]"
          alt="illustration"
          src="/images/confetti.gif"
        />
        {/* {on && (
            <img
              className="absolute inset-0 animate-ping"
              alt="illustration"
              src={"/images/illustrations/success_check.svg"}
            />
          )} */}
      </div>
      <h1 className="text-2xl font-bold mb-4 text-brand_dark text-center">
        ¡{event?.customer?.displayName} tu cita ha sido agendada!
      </h1>
      <p className="mb-8 text-center text-lg">
        Enviamos la información de la cita a{" "}
        <strong className="font-bold font-satoMiddle">
          {event?.customer?.email}
        </strong>
      </p>
      <div className="w-96 rounded-xl mx-auto bg-white shadow p-6 ">
        <h2 className="font-satoMedium font-bold text-xl md:text-2xl text-brand_dark mb-4">
          {event?.title}
        </h2>
        <ServiceList
          org={org}
          service={{ ...service }}
          date={event?.start ? new Date(event.start) : undefined}
        />
      </div>
      {/* @TODO: link to another schedule */}
      <PrimaryButton
        onClick={() => onFinish()}
        as="Link"
        to={getCTALink()}
        className="mt-12 py-4 w-[90%] mx-auto md:w-[160px] transition-all"
      >
        Agendar otra cita
      </PrimaryButton>
      <p className="text-neutral-400 text-xs mt-24 max-w-[600px] mx-auto">
        Recuerda que tu compra es válida para el servicio y horario en el que
        reservaste. Para cambios o cancelación ponte en contacto con Estudio
        Milán. Deník solo actúa como intermediario en la gestión y procesamiento
        de reservas.
      </p>
      <EmojiConfetti />
    </div>
  );
};
