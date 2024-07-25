import { getUserOrRedirect } from "~/db/userGetters";
import { db } from "../db.server";
import { z } from "zod";
import { json, redirect } from "@remix-run/node";

const URL_TO_REDIRECT = "/signup/tipo-de-negocio";
// z.coerce.string().email().min(5);
export const aboutYourCompanySchema = z.object({
  name: z.string(),
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
export const aboutYourCompanyHandler = async (
  request: Request,
  data: AboutYourCompanySchemaType
) => {
  const user = await getUserOrRedirect(request);
  const validatedData = aboutYourCompanySchema.parse({
    ...data,
    ownerId: user.id,
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
  throw redirect(URL_TO_REDIRECT);
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
