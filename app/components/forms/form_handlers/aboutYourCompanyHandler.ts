import { getUserOrRedirect } from "../../../.server/userGetters";
import { db } from "../../../utils/db.server";
import { z } from "zod";
import { json, redirect } from "@remix-run/node";
import { generateSlug } from "~/utils/generateSlug";
import { generateDummyService } from "~/utils/generators.server";

// CONSTS
const ABOUT_YOUR_BUSINESS_URL = "/signup/sobre-tu-negocio";
const TIPO_DE_NEGOCIO_URL = "/signup/tipo-de-negocio";
const HORARIO_URL = "/signup/horario";
const CARGANDO_URL = "/signup/cargando";

// ZOD Stuff
// z.coerce.string().email().min(5);
export const aboutYourCompanySchema = z.object({
  name: z.string(),
  slug: z.string(),
  ownerId: z.string(),
  shopKeeper: z.string().optional(),
  numberOfEmployees: z.string().optional(),
  address: z.string().optional(),
  // Business type
  // businessType      String?
  // Times
  // weekDays          Json?
});
export type AboutYourCompanySchemaType = z.infer<typeof aboutYourCompanySchema>;

const TypeOfBusinessSchema = z.object({
  businessType: z.string(),
});
type TypeOfBusinessType = z.infer<typeof TypeOfBusinessSchema>;
const tuple = z.array(z.array(z.string(), z.string())).optional();
const weekDaysSchema = z.object({
  lunes: tuple,
  martes: tuple,
  miércoles: tuple,
  jueves: tuple,
  sábado: tuple,
  domingo: tuple,
  viernes: tuple,
});
export type WeekDaysType = z.infer<typeof weekDaysSchema>;
//

// Handlers for signup
export const timesHandler = async (request: Request, data: WeekDaysType) => {
  const url = new URL(request.url);
  const orgId = url.searchParams.get("orgId");
  if (!orgId) {
    // @TODO: tolerate not org and create one?
    url.pathname = ABOUT_YOUR_BUSINESS_URL;
    throw redirect(url.toString());
  }
  const validatedData = weekDaysSchema.parse(data); // @TODO: skiped for now

  const user = await getUserOrRedirect(request);
  const org = await db.org.update({
    where: {
      id: orgId,
      ownerId: user.id,
    },
    data: { weekDays: validatedData }, // @TODO: for this form we tolerate the missing key?
  });
  await db.user.update({
    where: { id: user.id },
    data: {
      orgId,
    },
  });
  // create dummy
  generateDummyService(org); // it returns object but we ignore it
  url.searchParams.set("orgId", orgId);
  url.pathname = CARGANDO_URL;
  throw redirect(url.toString());
};
// @TODO: avoid repetition
export const typeOfBusinessHandler = async (
  request: Request,
  data: TypeOfBusinessType
) => {
  const url = new URL(request.url);
  const orgId = url.searchParams.get("orgId");
  if (!orgId) {
    url.pathname = ABOUT_YOUR_BUSINESS_URL;
    throw redirect(url.toString());
  }
  const validatedData = TypeOfBusinessSchema.parse(data);
  const user = await getUserOrRedirect(request);
  await db.org.update({
    where: {
      id: orgId,
      ownerId: user.id,
    },
    data: validatedData,
  });
  url.searchParams.set("orgId", orgId);
  url.pathname = HORARIO_URL;
  throw redirect(url.toString());
};

export const aboutYourCompanyHandler = async (
  request: Request,
  data: AboutYourCompanySchemaType
) => {
  const url = new URL(request.url);
  const user = await getUserOrRedirect(request);
  const validatedData = aboutYourCompanySchema.parse({
    ...data,
    ownerId: user.id,
    // slug
    slug: generateSlug(data.name),
  }); // throwing validation
  // if exists update with data @TODO: interrupt process? Not for now. jul 2024
  const orgs = await db.org.findMany({
    where: {
      ownerId: user.id,
    },
  });
  let org = orgs[0];
  if (org) {
    org = await db.org.update({
      where: { id: orgs[0].id },
      data: validatedData,
    });
  } else {
    org = await db.org.create({ data: validatedData });
  }
  //
  if (!org) return json(org, { status: 409 });
  url.searchParams.set("orgId", org.id);
  url.pathname = TIPO_DE_NEGOCIO_URL;
  throw redirect(url.toString());
};

// export const zodInputStringPipe = (zodPipe: ZodTypeAny) =>
//   z
//     .string()
//     .transform((value) => (value === '' ? null : value))
//     .nullable()
//     .refine((value) => value === null || !isNaN(Number(value)), {
//       message: 'Nombre Invalide',
//     })
//     .transform((value) => (value === null ? 0 : Number(value)))
//     .pipe(zodPipe);
