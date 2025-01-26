import { z } from "zod";

const rangesSchema = z
  .array(z.array(z.string(), z.string()), z.array(z.string(), z.string()))
  .optional();
export const signup3Schema = z.object({
  id: z.string().min(3),
  weekDays: z.object({
    lunes: rangesSchema,
    martes: rangesSchema,
    miércoles: rangesSchema,
    jueves: rangesSchema,
    viernes: rangesSchema,
    sábado: rangesSchema,
    domingo: rangesSchema,
  }),
});
export type Signup3SchemaType = z.infer<typeof signup2Schema>;

export const signup2Schema = z.object({
  id: z.string().min(3),
  businessType: z.string().min(3),
});
export type Signup2SchemaType = z.infer<typeof signup2Schema>;

export const signup1Schema = z.object({
  id: z.string().min(3),
  name: z.string().min(3),
  shopKeeper: z.string().min(3),
  address: z.string().optional().nullable(),
  numberOfEmployees: z.string().min(1),
});
export type Signup1SchemaType = z.infer<typeof signup1Schema>;

export const dayTupleSchema = z
  .array(z.array(z.string().min(5), z.string().min(5)))
  .optional();
export const weekTuples = z.object({
  lunes: dayTupleSchema,
  martes: dayTupleSchema,
  miércoles: dayTupleSchema,
  jueves: dayTupleSchema,
  viernes: dayTupleSchema,
  sábado: dayTupleSchema,
  domingo: dayTupleSchema,
});

export const weekDaysOrgSchema = z.object({
  weekDays: weekTuples,
});

export type WeekDaysOrg = z.infer<typeof weekDaysOrgSchema>;

//MODELS
// Event
export const newEventSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
  customerId: z.string().min(1),
  employeeId: z.string().min(1),
  serviceId: z.string().min(1),
  paid: z.boolean().default(false),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  duration: z
    .number()
    .min(5, { message: "La duración de la sesión, no puede ser negativa" })
    .default(60),
});

const typeEnum = z.enum(["Private", "Business"]);
// type: typeEnum.extract( [ 'Private' ] ),
