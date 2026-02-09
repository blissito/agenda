import { z } from "zod"

// Helper for optional number fields that can be empty strings
const optionalNumber = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? null : val),
  z.coerce.number().nullable()
)

export const serviceUpdateSchema = z.object({
  id: z.string().min(3),
  name: z.string().min(3),
  slug: z.string().min(3),
  orgId: z.string().min(3),
  description: z.string().optional().nullable(),
  price: z.coerce.number().optional(),
  points: z.coerce.number().optional(),
  address: z.string().optional().nullable(),
  lat: optionalNumber.optional(),
  lng: optionalNumber.optional(),
})
export type ServiceUpdateSchema = z.infer<typeof signup2Schema>

const rangesSchema = z.array(z.tuple([z.string(), z.string()])).optional()
export const weekSchema = z.object({
  monday: rangesSchema,
  tuesday: rangesSchema,
  wednesday: rangesSchema,
  thursday: rangesSchema,
  friday: rangesSchema,
  saturday: rangesSchema,
  sunday: rangesSchema,
})
export type WeekSchema = z.infer<typeof weekSchema>

export const signup3Schema = z.object({
  id: z.string().min(3),
  weekDays: weekSchema,
})
export type Signup3SchemaType = z.infer<typeof signup2Schema>

export const signup2Schema = z.object({
  id: z.string().min(3),
  businessType: z.string().min(3),
})
export type Signup2SchemaType = z.infer<typeof signup2Schema>

export const signup1Schema = z.object({
  id: z.string().min(3),
  name: z.string().min(3).optional(),
  shopKeeper: z.string().min(3).optional(),
  address: z.string().optional().nullable(),
  numberOfEmployees: z.string().min(1).optional(),
})
export type Signup1SchemaType = z.infer<typeof signup1Schema>

export const dayTupleSchema = z
  .array(z.tuple([z.string().min(5), z.string().min(5)]))
  .nullish()
export const weekTuples = z.object({
  monday: dayTupleSchema,
  tuesday: dayTupleSchema,
  wednesday: dayTupleSchema,
  thursday: dayTupleSchema,
  friday: dayTupleSchema,
  saturday: dayTupleSchema,
  sunday: dayTupleSchema,
})

export const weekDaysOrgSchema = z.object({
  weekDays: weekTuples,
})

export type WeekDaysOrg = z.infer<typeof weekDaysOrgSchema>

//MODELS
// Event
export const newEventSchema = z.object({
  id: z.string().optional(), // Allow id for updates
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
})

const _typeEnum = z.enum(["Private", "Business"])
// type: typeEnum.extract( [ 'Private' ] ),

// Customer
export const newCustomerSchema = z.object({
  displayName: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  tel: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
})
export type NewCustomerSchema = z.infer<typeof newCustomerSchema>

// Org update
export const orgSocialSchema = z.object({
  facebook: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  tiktok: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  x: z.string().optional().nullable(),
  youtube: z.string().optional().nullable(),
})

export const orgUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  shopKeeper: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  lat: optionalNumber.optional(),
  lng: optionalNumber.optional(),
  description: z.string().optional().nullable(),
  businessType: z.string().optional().nullable(),
  weekDays: weekTuples.optional(),
  email: z.union([z.string().email(), z.literal("")]).optional().nullable(),
  tel: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  social: orgSocialSchema.optional().nullable(),
  websiteConfig: z
    .object({
      color: z.string().optional().nullable(),
      template: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
})
export type OrgUpdateSchema = z.infer<typeof orgUpdateSchema>
