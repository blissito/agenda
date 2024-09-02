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
