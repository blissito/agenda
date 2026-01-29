import * as React from "react";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { db } from "~/utils/db.server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump";
import type { Service } from "@prisma/client";
import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { formatRange } from "~/components/common/FormatRange";
import type { Route } from "./+types/dash.servicios_.$serviceId";
import { Edit } from "~/components/icons/edit";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  // @TODO ensure is the owner
  const { org } = await getUserAndOrgOrRedirect(request);
  const service = await db.service.findUnique({
    where: { id: params.serviceId, orgId: org.id }, // @TODO: this can vary if multiple orgs
  });
  if (!service) throw new Response(null, { status: 404 });
  return {
    service: { ...service, config: service.config ? service.config : {} },
    orgWeekDays: org.weekDays,
  };
};

export default function Page({ loaderData }: Route.ComponentProps) {
  const { service, orgWeekDays } = loaderData;

  return (
    <section className="pb-10">
      <Breadcrumb className="text-brand_gray">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/servicios">Servicios</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/servicios/">{service.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 grid grid-cols-1 gap-6">
        <ServiceDetail service={service} orgWeekDays={orgWeekDays} />
      </div>
    </section>
  );
}

export const convertToMeridian = (hourString: string) => {
  const today = new Date();
  today.setHours(Number(hourString.split(":")[0]));
  today.setMinutes(Number(hourString.split(":")[1]));
  return today.toLocaleTimeString("es-MX", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  });
};

/**
 * ✅ Uploader LOCAL (sin BD / sin storage)
 * - Predeterminada mientras no subas nada
 * - NO duplica imágenes
 * - Animación en cada imagen nueva
 * - Scroll SOLO cuando ya hay 3 o más, y se mueve a la nueva
 */
function LocalFloatingGallery() {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const [images, setImages] = React.useState<
    { id: string; url: string; file: File; key: string }[]
  >([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [newIds, setNewIds] = React.useState<string[]>([]);

  const DEFAULT_MAIN_SRC = "/images/signin/Serve.png";

  // 2 predeterminadas abajo (solo antes de subir)
  const DEFAULT_THUMBS = [
    "/images/signin/Serve.png",
    "/images/signin/Serve.png",
  ];

  const getFileKey = (file: File) =>
    `${file.name}-${file.size}-${file.lastModified}`;

  React.useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPicker = () => inputRef.current?.click();

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setImages((prev) => {
      const usedKeys = new Set(prev.map((p) => p.key));
      const mapped: { id: string; url: string; file: File; key: string }[] = [];

      for (const file of files) {
        const key = getFileKey(file);
        if (usedKeys.has(key)) continue;
        usedKeys.add(key);

        mapped.push({
          id: `${key}-${Math.random().toString(16).slice(2)}`,
          url: URL.createObjectURL(file),
          file,
          key,
        });
      }

      if (mapped.length === 0) return prev;

      const next = [...prev, ...mapped];

      if (!activeId && next.length > 0) setActiveId(next[0].id);

      const ids = mapped.map((m) => m.id);
      setNewIds(ids);
      window.setTimeout(() => setNewIds([]), 900);


      if (next.length >= 3) {
        const lastNewId = mapped[mapped.length - 1].id;
        window.requestAnimationFrame(() => {
          const el = document.querySelector(
            `[data-thumb-id="${lastNewId}"]`
          ) as HTMLElement | null;

          if (el) {
            el.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "end",
            });
          }
        });
      }

      return next;
    });

    e.target.value = "";
  };

  const hasUploads = images.length > 0;

  const main = hasUploads
    ? images.find((x) => x.id === activeId) ?? images[0]
    : null;

  const mainUrl = hasUploads ? main?.url : DEFAULT_MAIN_SRC;

  return (
    <div className="flex flex-col">
      {/* solo para ocultar scrollbar (solo aquí) */}
      <style>{`
        .lg-scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
        .lg-scrollbar-hide::-webkit-scrollbar{ display:none; }

        @keyframes lg-thumb-pop {
          0%   { opacity: 0; transform: translateY(16px) scale(0.85); filter: blur(10px); }
          55%  { opacity: 1; transform: translateY(-8px) scale(1.08); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .lg-thumb-pop { animation: lg-thumb-pop 700ms cubic-bezier(.2,.9,.2,1) both; }
      `}</style>

      {/* Principal */}
      <div className="overflow-hidden rounded-2xl bg-neutral-100 border border-brand_stroke/50">
        <div className="relative w-full h-[280px] sm:h-[320px] lg:h-[340px]">
          <img
            src={mainUrl}
            alt="Imagen principal del servicio"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="mt-3">
        <div className="relative overflow-x-auto lg-scrollbar-hide">
          <div className="flex items-stretch gap-3 pr-2">
            {/* Miniaturas */}
            {!hasUploads
              ? DEFAULT_THUMBS.map((src, idx) => (
                  <div
                    key={`default-${idx}`}
                    className="h-24 sm:h-28 w-40 rounded-2xl overflow-hidden border border-brand_stroke/40 shrink-0 bg-neutral-50"
                  >
                    <img
                      src={src}
                      alt="Imagen predeterminada"
                      className="h-full w-full object-cover opacity-90"
                    />
                  </div>
                ))
              : images.map((img) => {
                  const isActive = img.id === (main?.id ?? "");
                  const isNew = newIds.includes(img.id);

                  return (
                    <button
                      key={img.id}
                      data-thumb-id={img.id}
                      type="button"
                      onClick={() => setActiveId(img.id)}
                      className={[
                        "h-24 sm:h-28 w-40 rounded-2xl overflow-hidden border shrink-0",
                        isActive
                          ? "border-neutral-900/40"
                          : "border-brand_stroke/50",
                        isNew ? "lg-thumb-pop" : "",
                      ].join(" ")}
                      aria-label="Seleccionar imagen"
                    >
                      <img
                        src={img.url}
                        alt="Miniatura"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}

            <div className="sticky right-0 shrink-0 flex items-stretch">
             
              <div className="pl-3 bg-white flex items-stretch">
                <button
                  type="button"
                  onClick={openPicker}
                  className="h-24 sm:h-28 w-56 rounded-2xl bg-neutral-50 border border-brand_stroke/60 flex items-center justify-center px-4 text-center hover:bg-neutral-100 transition"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 4C2.90694 4 2 4.90694 2 6V18C2 19.0931 2.90694 20 4 20H12V18H4V6H20V12H22V6C22 4.90694 21.0931 4 20 4H4ZM14.5 11L11 15L8.5 12.5L5.77734 16H16V13L14.5 11ZM18 14V18H14V20H18V24H20V20H24V18H20V14H18Z"
                          fill="#4B5563"
                        />
                      </svg>
                    </div>
                    <p className="font-satoMedium text-sm  text-brand_gray leading-tight">
                    
                      Agregar o editar fotos
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onPick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}




const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="font-satoMedium text-[14px] text-brand_gray">{label}</p>
    <p className="font-satoMedium  text-brand_dark">{value}</p>
  </div>
);

const WeekDayRow = ({ day, schedule }: { day: string; schedule: React.ReactNode }) => (
  <div className="grid grid-cols-[110px_1fr] items-center gap-4">
    <p className="font-satoMedium text-brand_gray">{day}</p>
    <p className="font-satoMedium text-brand_dark">{schedule}</p>
  </div>
);

const EditButton = ({ to, label }: { to: string; label: string }) => (
  <SecondaryButton
    className="!h-10 !w-10 !min-w-0 !p-0 !rounded-full overflow-hidden flex items-center justify-center bg-neutral-100"
    as="Link"
    to={to}
    aria-label={label}
  >
    <Edit fill="currentColor" className="h-5 w-5" />
  </SecondaryButton>
);

const WEEK_DAYS = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miércoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sábado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
] as const;

export const ServiceDetail = ({
  service,
  orgWeekDays,
}: {
  service: Service;
  orgWeekDays: any;
}) => {
  return (
    
    <div className="w-full">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <div className="bg-white rounded-2xl p-6 sm:p-8 lg:col-span-5 border border-brand_stroke/60 h-full flex flex-col">
  <div className="flex items-center justify-between gap-4">
    <div className="min-w-0">
      {/*{service.category ?(<-- Nombre de la categoria   
            <span className="inline-flex items-center gap-2 rounded-[4px] bg-[#D5FAF1] px-3 py-1 text-[14px] font-satoMedium text-[#2A645F]">
             
              </span>
               ):null */}
      <h2 className="font-satoBold text-[24px]  text-brand_dark">
        {service.name}
      </h2>
    </div>

    <EditButton to={`/dash/servicios/${service.id}/general`} label="Editar" />
  </div>
  <p className="mt-4 max-w-[46ch] font-satoMedium text-brand_gray">
    {service.description}
  </p>
  <div className="mt-8 space-y-6">
    <div className="grid grid-cols-2 gap-10">
      <DetailItem label="Servicio" value={service.place || ""} />
      <DetailItem label="Agendamiento en línea" value={service.isActive ? "Activo" : "Desactivado"} />
    </div>
    <DetailItem
      label="Agendamiento simultáneo"
      value={service.allowMultiple ? `hasta ${service.limit?.bookings || 6} citas` : "Desactivado"}
    />
  </div>

 
  <div className="mt-auto pt-10">
    <div className="grid grid-cols-2 gap-10 items-end">
      <div className="space-y-2">
        <p className=" text-[14px] font-satoMedium text-brand_dark">
          Precio
        </p>
        <div className="inline-flex items-center  rounded-full border border-brand_stroke bg-white px-4 py-2  text-brand_gray">
          ${service.price} MXN
        </div>
      </div>

      <div className="space-y-2">
        <p className=" text-[14px] font-satoMedium text-brand_dark">
          Puntos
        </p>
        <div className="inline-flex items-center rounded-full border border-brand_stroke bg-white px-4 py-2  text-brand_gray">
          {service.points} puntos
        </div>
      </div>
    </div>
  </div>
</div>
        <div className="bg-white rounded-2xl p-6 sm:p-8 lg:col-span-7 border border-brand_stroke/60">
          <LocalFloatingGallery />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="bg-white rounded-2xl p-6 sm:p-8 lg:col-span-6 border border-brand_stroke/60">
          <div className="flex items-center justify-between">
            <h3 className="font-satoBold text-lg text-brand_dark">Horario</h3>
            <EditButton to={`/dash/servicios/${service.id}/horario`} label="Editar horario" />
          </div>

          <p className="mt-3 font-satoMedium">
            Sesiones de <span className="text-brand_dark">{service.duration} minutos</span> con <span className="text-brand_dark">0 minutos</span> de descanso.
          </p>

          <div className="mt-5 space-y-4">
            {WEEK_DAYS.map(({ key, label }) => (
              <WeekDayRow key={key} day={label} schedule={formatRange(orgWeekDays[key])} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 lg:col-span-6 border border-brand_stroke/60">
          <div className="flex items-center justify-between">
            <h3 className="font-satoBold text-lg text-brand_dark">Recordatorios y pago</h3>
            <EditButton to={`/dash/servicios/${service.id}/cobros`} label="Editar cobros" />
          </div>

          <div className="mt-4 space-y-4">
            <DetailItem label="Pago" value="Al agendar" />
            <DetailItem
              label="Mail de confirmación"
              value={service.config?.confirmation
                ? "Lo enviamos en cuanto se completa la reservación"
                : "Desactivado"}
            />
            <DetailItem
              label="Mail de recordatorio"
              value={service.config?.confirmation
                ? "Lo enviaremos 24 hrs antes de la sesión"
                : "Desactivado"}
            />
            <DetailItem
              label="Whats app de recordatorio"
              value={service.config?.survey
                ? "Lo enviamos 4hrs antes de la sesión"
                : "Desactivado"}
            />
            <DetailItem
              label="Mail de evaluación"
              value={service.config?.confirmation
                ? "Lo enviamos 10 min después de terminar la sesión"
                : "Desactivado"}
            />
          </div>

        </div>
      </div>

    </div>
  );
};
