import { z } from "zod";
import { db } from "~/utils/db.server";
import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import {
  addCertificate,
  checkCertificate,
  deleteCertificate,
  mapFlyStatusToDbStatus,
} from "~/.server/fly";
import type { ActionFunctionArgs } from "react-router";

// Reserved domains that cannot be used as custom domains
const RESERVED_DOMAINS = [
  "denik.me",
  "denik.com",
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "fly.dev",
  "fly.io",
];

const domainSchema = z
  .string()
  .min(1, "El dominio no puede estar vacío")
  .max(253, "El dominio es demasiado largo")
  .regex(
    /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
    "Dominio inválido. Ejemplo: agenda.minegocio.com"
  )
  .refine(
    (domain) => {
      const normalized = domain.toLowerCase();
      return !RESERVED_DOMAINS.some(
        (reserved) =>
          normalized === reserved || normalized.endsWith(`.${reserved}`)
      );
    },
    { message: "Este dominio no está permitido" }
  );

// Schema to validate DNS instructions from database
export const domainDnsSchema = z.object({
  type: z.string(),
  name: z.string(),
  value: z.string(),
  validationHostname: z.string().optional(),
  validationTarget: z.string().optional(),
});

export type DomainDns = z.infer<typeof domainDnsSchema>;

export const action = async ({ request }: ActionFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  // Validate intent is provided and is a string
  if (typeof intent !== "string" || !intent) {
    return Response.json({ error: "Intent no proporcionado" }, { status: 400 });
  }

  if (intent === "add_domain") {
    const domain = formData.get("domain");

    // Ensure domain is a string before validation
    if (typeof domain !== "string") {
      return Response.json(
        { error: "Dominio no proporcionado" },
        { status: 400 }
      );
    }

    const validation = domainSchema.safeParse(domain);
    if (!validation.success) {
      return Response.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const normalizedDomain = domain.toLowerCase().trim();

    // Check if domain already used by another org
    const existingOrg = await db.org.findUnique({
      where: { customDomain: normalizedDomain },
    });
    if (existingOrg && existingOrg.id !== org.id) {
      return Response.json(
        { error: "Este dominio ya está en uso por otra organización" },
        { status: 400 }
      );
    }

    // Create certificate in Fly.io
    const result = await addCertificate(normalizedDomain);

    if (!result.success) {
      return Response.json(
        { error: result.error || "Error al configurar el dominio" },
        { status: 500 }
      );
    }

    // Save to DB
    // For DNS name: if domain is "agenda.empresa.com", name should be "agenda"
    // For root domain like "empresa.com", name should be "@"
    // For multi-level subdomains like "citas.agenda.empresa.com", name should be "citas.agenda"
    const domainParts = normalizedDomain.split(".");
    const dnsName =
      domainParts.length <= 2
        ? "@" // root domain (empresa.com)
        : domainParts.slice(0, -2).join("."); // subdomain(s)

    const dnsInstructions: DomainDns = {
      type: "CNAME",
      name: dnsName,
      value: `${process.env.FLY_APP_NAME || "denik"}.fly.dev`,
      validationHostname: result.dnsValidationHostname,
      validationTarget: result.dnsValidationTarget,
    };

    await db.org.update({
      where: { id: org.id },
      data: {
        customDomain: normalizedDomain,
        customDomainStatus: mapFlyStatusToDbStatus(result.status || "Awaiting"),
        customDomainDns: dnsInstructions,
      },
    });

    return Response.json({
      success: true,
      domain: normalizedDomain,
      status: mapFlyStatusToDbStatus(result.status || "Awaiting"),
      dns: dnsInstructions,
    });
  }

  if (intent === "check_domain") {
    if (!org.customDomain) {
      return Response.json(
        { error: "No hay dominio configurado" },
        { status: 400 }
      );
    }

    const result = await checkCertificate(org.customDomain);

    if (!result.success) {
      return Response.json(
        { error: result.error || "Error al verificar el dominio" },
        { status: 500 }
      );
    }

    const newStatus = mapFlyStatusToDbStatus(result.status || "Awaiting");

    // Update status in DB
    await db.org.update({
      where: { id: org.id },
      data: { customDomainStatus: newStatus },
    });

    return Response.json({
      success: true,
      domain: org.customDomain,
      status: newStatus,
    });
  }

  if (intent === "remove_domain") {
    if (!org.customDomain) {
      return Response.json(
        { error: "No hay dominio configurado" },
        { status: 400 }
      );
    }

    const result = await deleteCertificate(org.customDomain);

    if (!result.success) {
      return Response.json(
        { error: result.error || "Error al eliminar el dominio" },
        { status: 500 }
      );
    }

    await db.org.update({
      where: { id: org.id },
      data: {
        customDomain: null,
        customDomainStatus: null,
        customDomainDns: null,
      },
    });

    return Response.json({ success: true });
  }

  return Response.json({ error: "Intent no válido" }, { status: 400 });
};
