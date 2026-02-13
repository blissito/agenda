
import * as React from "react";
import Lottie from "lottie-react";
import DownloadAnim from "../animations/Downloads2.json";
import ConfirmAnim from "../animations/Confirm2.json";

export type DownloadStatus =
  | "preparing"
  | "generating"
  | "downloading"
  | "done"
  | "error";

export type ClientForCsv = {
  displayName: string | null;
  email: string;
  tel?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  nextEventDate?: Date | string | null;
  points?: number | null;
  eventCount?: number | null;
  address?: string | null;
  direccion?: string | null;
  [key: string]: any;
};

type DownloadToastProps = {
  open: boolean;
  fileName: string;
  status: DownloadStatus;
  onClose: () => void;
  title?: string;
};

function statusText(status: DownloadStatus) {
  if (status === "preparing") return "Preparando descarga...";
  if (status === "generating") return "Generando archivo CSV...";
  if (status === "downloading") return "Iniciando descarga...";
  if (status === "done") return "Descarga completa";
  if (status === "error") return "Ocurrió un error al descargar";
  return "";
}
function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}

function FallbackSpinner() {
  return (
    <div className="h-11 w-11 rounded-full border-[5px] border-slate-200 border-t-slate-500 animate-spin" />
  );
}

export const DownloadToast: React.FC<DownloadToastProps> = ({
  open,
  fileName,
  status,
  onClose,
  title = "Descargando archivos 0/1",
}) => {
  if (!open) return null;

  const isDone = status === "done";
  const isError = status === "error";
  const currentAnim = isDone ? ConfirmAnim : DownloadAnim;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[92vw]">
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-[0_18px_55px_rgba(0,0,0,0.25)]">
        <div className="bg-black text-white px-5 py-3 text-sm font-satoMedium">
          {title}
        </div>
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="h-11 w-11 flex items-center justify-center">
            <ClientOnly fallback={<FallbackSpinner />}>
              <Lottie
                animationData={currentAnim}
                loop={!isDone && !isError}
                autoplay
              />
            </ClientOnly>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-satoMedium truncate">{fileName}</p>
            <p className="text-[14px] text-brand_gray">
              {statusText(status)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-full hover:bg-slate-100 active:scale-95"
            aria-label="Cerrar"
            title="Cerrar"
          >
            <span className="text-2xl leading-none text-brand_gray">×</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------- Helpers para el CSV ----------------------- */

function ensureDate(value?: Date | string | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(value?: Date | string | null): string {
  const d = ensureDate(value);
  if (!d) return "";
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function csvValue(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

function buildClientsCsv(clients: ClientForCsv[]): string {
  const headers = [
    "nombre",
    "email",
    "teléfono",
    "dirección",
    "registro",
    "puntos",
    "citas",
    "próxima cita",
  ];

  const rows = clients.map((c) => {
    const nombre = c.displayName ?? "";
    const email = c.email ?? "";
    const telefono = c.tel ?? "";
    const direccion = c.address ?? c.direccion ?? "";
    const registro = formatDate(c.createdAt || c.updatedAt);
    const puntos =
      typeof c.points === "number" && !isNaN(c.points) ? c.points : "";
    const citas =
      typeof c.eventCount === "number" && !isNaN(c.eventCount)
        ? c.eventCount
        : "";
    const proximaCita = formatDate(c.nextEventDate);

    return [
      csvValue(nombre),
      csvValue(email),
      csvValue(telefono),
      csvValue(direccion),
      csvValue(registro),
      csvValue(puntos),
      csvValue(citas),
      csvValue(proximaCita),
    ].join(",");
  });

  // Si no hay clientes, se descarga solo la fila de encabezados (CSV vacío pero válido)
  return [headers.join(","), ...rows].join("\n");
}

/* --------------------- Hook para usar el toast --------------------- */

export function useDownloadToast({
  clients,
  orgName,
}: {
  clients: ClientForCsv[];
  orgName?: string; // nombre de la empresa para el archivo
}) {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] =
    React.useState<DownloadStatus>("preparing");
  const [fileName, setFileName] = React.useState("clientes.csv");

  // candado para descargas  descomentar para que se deshabilite el boton si no hay clientes
  /*const canDownload = !!clients && clients.length > 0;*/
  const canDownload = true;

  const startDownload = React.useCallback(() => {
    /*if (!canDownload) return;*/

    // Nombre dinámico: nombreEmpresa_DD-MM-YYYY.csv
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const datePart = `${day}-${month}-${year}`; // 03-02-2026

    const safeOrg =
      (orgName || "empresa")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase() || "empresa";

    const dynamicName = `${safeOrg}_${datePart}.csv`;
    setFileName(dynamicName);

    setOpen(true);
    setStatus("preparing");

    try {
      // 1) Preparando
      setTimeout(() => {
        setStatus("generating");

        // 2) Generamos el CSV a partir de los clientes (puede venir vacío)
        setTimeout(() => {
          const csv = buildClientsCsv(clients || []);

          const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8",
          });

          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = dynamicName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);

          setStatus("downloading");
          setTimeout(() => {
            setStatus("done");
            setTimeout(() => {
              setOpen(false);
              setStatus("preparing");
            }, 900);
          }, 700);
        }, 700);
      }, 400);
    } catch (e) {
      console.error("Error generando CSV de clientes", e);
      setStatus("error");
    }
  }, [clients, orgName, canDownload]);

  // Nombre de la empresa para mostrar en el título
  const companyName =
    (orgName && orgName.trim()) || "Empresa";

  const totalFiles = 1;
  const downloadedFiles =
    status === "downloading" || status === "done" ? 1 : 0;

  const dynamicTitle = `${companyName} — Descargando archivos ${downloadedFiles}/${totalFiles}`;

  const toast = (
    <DownloadToast
      open={open}
      fileName={fileName}
      status={status}
      onClose={() => setOpen(false)}
      title={dynamicTitle}
    />
  );

  return { startDownload, toast, canDownload };
}
