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
import { InfoBox } from "../website/InfoBox";

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

  // contenedor de la “banda” de abajo (miniaturas + botón)
  const thumbsBarRef = React.useRef<HTMLDivElement | null>(null);

  const [images, setImages] = React.useState<
    { id: string; url: string; file: File; key: string }[]
  >([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // ✅ ids recién agregados (para animar TODAS las nuevas)
  const [newIds, setNewIds] = React.useState<string[]>([]);

  // ✅ imagen principal predeterminada
  const DEFAULT_MAIN_SRC = "/images/signin/Serve.png";

  // ✅ “2 imágenes de abajo” predeterminadas (se ven SOLO antes de subir)
  // cámbialas por las tuyas si quieres
  const DEFAULT_THUMBS = [
    "/images/signin/Serve2.png",
    "/images/signin/Serve3.png",
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
        if (usedKeys.has(key)) continue; // ✅ no repetir
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

      // ✅ animación cada vez que subes (todas las nuevas)
      const ids = mapped.map((m) => m.id);
      setNewIds(ids);
      window.setTimeout(() => setNewIds([]), 900);

      // ✅ scroll SOLO cuando ya existan 3 o más (se mueve a la última nueva)
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

  // ✅ IMPORTANTE: esta banda inferior SIEMPRE existe (altura fija)
  // para que NO “brinque” la sección de abajo.
  const BAR_HEIGHT = "h-28"; // altura constante (igual con o sin thumbs)

  return (
    <div className="h-full flex flex-col">
      {/* Principal */}
      <div className="overflow-hidden rounded-2xl bg-neutral-100 border border-brand_stroke/50">
        <div className="relative w-full h-[280px] sm:h-[320px] lg:h-[340px]">
          {mainUrl ? (
            <img
              src={mainUrl}
              alt="Imagen principal del servicio"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <div className="h-[72%] w-[72%] rounded-2xl bg-neutral-50 border border-brand_stroke/40" />
            </div>
          )}
        </div>
      </div>

      {/* Banda inferior (NO colapsa, NO desaparece) */}
      <div
        ref={thumbsBarRef}
        className={[
          "mt-4 flex items-center gap-4",
          BAR_HEIGHT,
        ].join(" ")}
      >
        {/* Miniaturas (o predeterminadas) */}
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-3 pr-2 overflow-x-auto lg-scrollbar-hide">
            {!hasUploads ? (
              // ✅ 2 “predeterminadas” abajo (solo antes de subir)
              DEFAULT_THUMBS.map((src, idx) => (
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
            ) : (
              images.map((img) => {
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
                      isActive ? "border-neutral-900/40" : "border-brand_stroke/50",
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
              })
            )}
          </div>
        </div>

        {/* ✅ Botón más angosto (antes w-64) */}
        <button
          type="button"
          onClick={openPicker}
          className="h-24 sm:h-28 w-52 rounded-2xl bg-neutral-50 border border-brand_stroke/60 flex items-center justify-center px-3 text-center hover:bg-neutral-100 transition shrink-0"
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white border border-brand_stroke/60">
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
            <p className="text-sm font-medium text-neutral-900 leading-tight">
              Agregar o editar fotos
            </p>
          </div>
        </button>

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
  );
}


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
        <div className="bg-white rounded-2xl p-6 sm:p-8 lg:col-span-5 border border-brand_stroke/60 h-full">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-flex items-center rounded-full border border-brand_stroke/70 bg-neutral-50 px-3 py-1 text-xs text-brand_gray">
                {service.name}
              </span>

              <h2 className="mt-3 text-2xl font-bold font-jakarta text-neutral-900">
                {service.name}
              </h2>

              <p className="mt-3 text-sm leading-6 text-brand_gray">
                {service.description}
              </p>
            </div>

            <SecondaryButton
              className=" !h-10 !w-10 !min-w-0 !p-0 !rounded-full overflow-hidden flex items-center justify-center bg-neutral-100"
              as="Link"
              to={`/dash/servicios/${service.id}/general`}
              aria-label="Editar"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path
                  d="M16.8691 10.6187C16.5254 10.6187 16.2441 10.9 16.2441 11.2437V14.375C16.2441 15.4062 15.4004 16.25 14.3691 16.25H5.61914C4.58789 16.25 3.74414 15.4062 3.74414 14.375V5.625C3.74414 4.59375 4.58789 3.75 5.61914 3.75H9.99414C10.3379 3.75 10.6191 3.46875 10.6191 3.125C10.6191 2.78125 10.3379 2.5 9.99414 2.5H5.61914C3.89414 2.5 2.49414 3.9 2.49414 5.625V14.375C2.49414 16.1 3.89414 17.5 5.61914 17.5H14.3691C16.0941 17.5 17.4941 16.1 17.4941 14.375V11.2437C17.4941 10.9 17.2129 10.6187 16.8691 10.6187Z"
                  fill="currentColor"
                />
                <path
                  d="M7.8125 9.375V10.8187C7.8125 11.575 8.425 12.1875 9.18125 12.1875H10.625C10.9938 12.1875 11.3375 12.0438 11.5937 11.7875L17.0938 6.2875C17.625 5.75 17.625 4.88125 17.0938 4.35L15.65 2.90625C15.1125 2.375 14.2438 2.375 13.7125 2.90625L8.2125 8.40625C7.95625 8.6625 7.8125 9.0125 7.8125 9.375ZM9.0625 9.375C9.0625 9.34375 9.075 9.3125 9.1 9.2875L14.6 3.7875C14.6 3.7875 14.6562 3.75 14.6875 3.75C14.7188 3.75 14.75 3.7625 14.775 3.7875L16.2188 5.23125C16.2688 5.28125 16.2688 5.35625 16.2188 5.40625L10.7187 10.9063C10.7187 10.9063 10.6625 10.9438 10.6313 10.9438H9.1875C9.11875 10.9438 9.06875 10.8875 9.06875 10.825V9.38125L9.0625 9.375Z"
                  fill="currentColor"
                />
              </svg>
            </SecondaryButton>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-brand_gray">Servicio</p>
                <p className="mt-1 text-sm text-neutral-900">{service.place}</p>
              </div>

              <div>
                <p className="text-xs text-brand_gray">Agendamiento en línea</p>
                <p className="mt-1 text-sm text-neutral-900">
                  {service.isActive ? "Activo" : "Desactivado"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-brand_gray">Agendamiento simultáneo</p>
              <p className="mt-1 text-sm text-neutral-900">
                {service.allowMultiple
                  ? `hasta ${service.limit?.bookings || 6} citas`
                  : "Desactivado"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-brand_gray">Precio</p>
              <div className="mt-2 inline-flex items-center rounded-full border border-brand_stroke/70 bg-white px-4 py-2 text-sm text-neutral-900">
                ${service.price} MXN
              </div>
            </div>

            <div>
              <p className="text-xs text-brand_gray">Puntos</p>
              <div className="mt-2 inline-flex items-center rounded-full border border-brand_stroke/70 bg-white px-4 py-2 text-sm text-neutral-900">
                {service.points} puntos
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 lg:col-span-7 border border-brand_stroke/60 h-full">
          <LocalFloatingGallery />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="bg-white rounded-2xl p-6 sm:p-8 lg:col-span-6 border border-brand_stroke/60">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900">Horario</h3>

            <SecondaryButton
              className=" !h-10 !w-10 !min-w-0 !p-0 !rounded-full overflow-hidden flex items-center justify-center bg-neutral-100"
              as="Link"
              to={`/dash/servicios/${service.id}/horario`}
              aria-label="Editar horario"
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
                <path
                  d="M16.8691 10.6187C16.5254 10.6187 16.2441 10.9 16.2441 11.2437V14.375C16.2441 15.4062 15.4004 16.25 14.3691 16.25H5.61914C4.58789 16.25 3.74414 15.4062 3.74414 14.375V5.625C3.74414 4.59375 4.58789 3.75 5.61914 3.75H9.99414C10.3379 3.75 10.6191 3.46875 10.6191 3.125C10.6191 2.78125 10.3379 2.5 9.99414 2.5H5.61914C3.89414 2.5 2.49414 3.9 2.49414 5.625V14.375C2.49414 16.1 3.89414 17.5 5.61914 17.5H14.3691C16.0941 17.5 17.4941 16.1 17.4941 14.375V11.2437C17.4941 10.9 17.2129 10.6187 16.8691 10.6187Z"
                  fill="currentColor"
                />
                <path
                  d="M7.8125 9.375V10.8187C7.8125 11.575 8.425 12.1875 9.18125 12.1875H10.625C10.9938 12.1875 11.3375 12.0438 11.5937 11.7875L17.0938 6.2875C17.625 5.75 17.625 4.88125 17.0938 4.35L15.65 2.90625C15.1125 2.375 14.2438 2.375 13.7125 2.90625L8.2125 8.40625C7.95625 8.6625 7.8125 9.0125 7.8125 9.375ZM9.0625 9.375C9.0625 9.34375 9.075 9.3125 9.1 9.2875L14.6 3.7875C14.6 3.7875 14.6562 3.75 14.6875 3.75C14.7188 3.75 14.75 3.7625 14.775 3.7875L16.2188 5.23125C16.2688 5.28125 16.2688 5.35625 16.2188 5.40625L10.7187 10.9063C10.7187 10.9063 10.6625 10.9438 10.6313 10.9438H9.1875C9.11875 10.9438 9.06875 10.8875 9.06875 10.825V9.38125L9.0625 9.375Z"
                  fill="currentColor"
                />
              </svg>
            </SecondaryButton>
          </div>

          <p className="mt-3 text-sm text-brand_gray">
            Sesiones de{" "}
            <span className="font-bold font-satoMedium text-neutral-900">
              {service.duration} minutos
            </span>{" "}
            con{" "}
            <span className="font-bold font-satoMedium text-neutral-900">
              0 minutos
            </span>{" "}
            de descanso.
          </p>

          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-[110px_1fr] items-center gap-4">
              <p className="text-sm text-neutral-900">Lunes</p>
              <p className="text-sm text-brand_gray">{formatRange(orgWeekDays["lunes"])}</p>
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-4">
              <p className="text-sm text-neutral-900">Martes</p>
              <p className="text-sm text-brand_gray">{formatRange(orgWeekDays["martes"])}</p>
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-4">
              <p className="text-sm text-neutral-900">Miércoles</p>
              <p className="text-sm text-brand_gray">{formatRange(orgWeekDays["miércoles"])}</p>
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-4">
              <p className="text-sm text-neutral-900">Jueves</p>
              <p className="text-sm text-brand_gray">{formatRange(orgWeekDays["jueves"])}</p>
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-4">
              <p className="text-sm text-neutral-900">Viernes</p>
              <p className="text-sm text-brand_gray">{formatRange(orgWeekDays["viernes"])}</p>
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-4">
              <p className="text-sm text-neutral-900">Sábado</p>
              <p className="text-sm text-brand_gray">{formatRange(orgWeekDays["sábado"])}</p>
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-4">
              <p className="text-sm text-neutral-900">Domingo</p>
              <p className="text-sm text-brand_gray">{formatRange(orgWeekDays["domingo"])}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 lg:col-span-6 border border-brand_stroke/60">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900">Recordatorios y pago</h3>

            <SecondaryButton
              className=" !h-10 !w-10 !min-w-0 !p-0 !rounded-full overflow-hidden flex items-center justify-center bg-neutral-100"
              as="Link"
              to={`/dash/servicios/${service.id}/cobros`}
              aria-label="Editar cobros"
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
                <path
                  d="M16.8691 10.6187C16.5254 10.6187 16.2441 10.9 16.2441 11.2437V14.375C16.2441 15.4062 15.4004 16.25 14.3691 16.25H5.61914C4.58789 16.25 3.74414 15.4062 3.74414 14.375V5.625C3.74414 4.59375 4.58789 3.75 5.61914 3.75H9.99414C10.3379 3.75 10.6191 3.46875 10.6191 3.125C10.6191 2.78125 10.3379 2.5 9.99414 2.5H5.61914C3.89414 2.5 2.49414 3.9 2.49414 5.625V14.375C2.49414 16.1 3.89414 17.5 5.61914 17.5H14.3691C16.0941 17.5 17.4941 16.1 17.4941 14.375V11.2437C17.4941 10.9 17.2129 10.6187 16.8691 10.6187Z"
                  fill="currentColor"
                />
                <path
                  d="M7.8125 9.375V10.8187C7.8125 11.575 8.425 12.1875 9.18125 12.1875H10.625C10.9938 12.1875 11.3375 12.0438 11.5937 11.7875L17.0938 6.2875C17.625 5.75 17.625 4.88125 17.0938 4.35L15.65 2.90625C15.1125 2.375 14.2438 2.375 13.7125 2.90625L8.2125 8.40625C7.95625 8.6625 7.8125 9.0125 7.8125 9.375ZM9.0625 9.375C9.0625 9.34375 9.075 9.3125 9.1 9.2875L14.6 3.7875C14.6 3.7875 14.6562 3.75 14.6875 3.75C14.7188 3.75 14.75 3.7625 14.775 3.7875L16.2188 5.23125C16.2688 5.28125 16.2688 5.35625 16.2188 5.40625L10.7187 10.9063C10.7187 10.9063 10.6625 10.9438 10.6313 10.9438H9.1875C9.11875 10.9438 9.06875 10.8875 9.06875 10.825V9.38125L9.0625 9.375Z"
                  fill="currentColor"
                />
              </svg>
            </SecondaryButton>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-[160px_1fr] items-start gap-4">
              <p className="text-xs text-brand_gray">Pago</p>
              <p className="text-sm text-neutral-900">Al agendar</p>
            </div>
            <div className="grid grid-cols-[160px_1fr] items-start gap-4">
              <p className="text-xs text-brand_gray">Mail de confirmación</p>
              <p className="text-sm text-neutral-900">
                {service.config?.confirmation
                  ? "Lo enviamos en cuanto se completa la reservación"
                  : "Desactivado"}
              </p>
            </div>
            <div className="grid grid-cols-[160px_1fr] items-start gap-4">
              <p className="text-xs text-brand_gray">Mail de recordatorio</p>
              <p className="text-sm text-neutral-900">
                {service.config?.confirmation
                  ? "Lo enviaremos 24 hrs antes de la sesión"
                  : "Desactivado"}
              </p>
            </div>
            <div className="grid grid-cols-[160px_1fr] items-start gap-4">
              <p className="text-xs text-brand_gray">Whats app de recordatorio</p>
              <p className="text-sm text-neutral-900">
                {service.config?.survey
                  ? "Lo enviamos 4hrs antes de la sesión"
                  : "Desactivado"}
              </p>
            </div>
            <div className="grid grid-cols-[160px_1fr] items-start gap-4">
              <p className="text-xs text-brand_gray">Mail de evaluación</p>
              <p className="text-sm text-neutral-900">
                {service.config?.confirmation
                  ? "Lo enviamos 10 min después de terminar la sesión"
                  : "Desactivado"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* compatibilidad */}
      <div className="hidden">
        <InfoBox title="Precio" value={<span>${service.price} mxn</span>} />
        <InfoBox title="Puntos" value={service.points} />
        <InfoBox title="Descripción" value={service.description} />
      </div>
    </div>
  );
};
