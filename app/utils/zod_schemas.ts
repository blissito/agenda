import { z } from "zod";

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
