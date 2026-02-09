import { type Event, type Org, type Prisma, type User } from "@prisma/client"
import { nanoid } from "nanoid"
import { redirect } from "react-router"
import slugify from "slugify"
import type { ZodSchema } from "zod"
import { commitSession, getSession } from "~/sessions"
import { db } from "~/utils/db.server"
import { validateUserToken } from "~/utils/tokens"
import { normalizeWeekDays } from "~/utils/weekDays"
import {
  type Signup1SchemaType,
  type Signup2SchemaType,
  type Signup3SchemaType,
  signup1Schema,
  signup2Schema,
  signup3Schema,
} from "~/utils/zod_schemas"
import { getOAuthUser, isValidProvider } from "./oauth"

export const redirectIfUser = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"))
  if (session.has("userId")) {
    // Verify user actually exists in DB
    const user = await db.user.findUnique({
      where: { id: session.get("userId") },
    })
    if (user) {
      throw redirect("/dash")
    }
    // User doesn't exist, clear invalid session
    session.unset("userId")
    throw redirect("/signin", {
      headers: { "Set-Cookie": await commitSession(session) },
    })
  }
}

export const getUserOrRedirect = async (
  request: Request,
  options: { redirectURL?: string } = { redirectURL: "/signin" },
) => {
  const session = await getSession(request.headers.get("Cookie"))
  const userId = session.get("userId")

  // Build redirect URL with next parameter
  const url = new URL(request.url)
  const currentPath = url.pathname + url.search
  const baseRedirect = options.redirectURL || "/signin"
  const redirectWithNext = `${baseRedirect}?next=${encodeURIComponent(currentPath)}`

  if (!userId) {
    throw redirect(redirectWithNext)
  }

  const user = await db.user.findUnique({ where: { id: userId } })

  if (!user) {
    // Clear invalid session
    session.unset("userId")
    throw redirect(redirectWithNext, {
      headers: { "Set-Cookie": await commitSession(session) },
    })
  }

  return user
}

export const getUserOrNull = async (request: Request): Promise<User | null> => {
  const session = await getSession(request.headers.get("Cookie"))
  if (!session.has("userId")) return null
  const user = await db.user.findUnique({
    where: { id: session.get("userId") },
  })
  if (!user) return null
  return user
}

const ADMINS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean)

export const getAdminUserOrRedirect = async (
  request: Request,
): Promise<User> => {
  const session = await getSession(request.headers.get("Cookie"))
  if (!session.has("userId")) {
    throw redirect("/")
  }
  const user = (await db.user.findUnique({
    where: { email: session.get("userId") },
  })) as User
  if (!user) {
    throw redirect("/")
  }
  if (!ADMINS.includes(user.email)) {
    throw redirect("/")
  }
  return user
}

/**
 * Org stuff
 */
export const getOrCreateOrgOrRedirect = async (request: Request) => {
  const user = await getUserOrNull(request)
  if (!user) throw redirect("/signin")
  // if working fine
  if (user.orgId) {
    const found = await db.org.findUnique({ where: { id: user.orgId } })
    if (found) {
      if (found.weekDays) {
        found.weekDays = normalizeWeekDays(found.weekDays as any) as any
      }
      return found
    }
  }
  // Multi orgs? YES
  let exists = await db.org.findFirst({ where: { ownerId: user.id } })
  if (!exists) {
    exists = await db.org.create({
      data: {
        ownerId: user.id,
        name: "New Denik Org",
        slug: `new-denik-org-${nanoid(4)}`,
        email: user.email,
        isActive: false,
      },
    })
  }
  await db.user.update({
    where: { id: user.id },
    data: { orgIds: { push: exists.id }, orgId: exists.id },
  })
  if (exists.isActive) {
    throw redirect("/dash")
  }
  if (exists.weekDays) {
    exists.weekDays = normalizeWeekDays(exists.weekDays as any) as any
  }
  return exists
}

// used in loaders

export const getUserAndOrgOrRedirect = async (
  request: Request,
  options: { redirectURL?: string; select?: Prisma.OrgSelect } = {},
): Promise<{ user: User; org: Org | null }> => {
  const rurl = options?.redirectURL || "/signup/1"
  const user = await getUserOrNull(request)
  if (!user) throw redirect(rurl)

  // Allow customers without Org to access dashboard
  if (user.role === "customer" && !user.orgId) {
    return { user, org: null }
  }

  if (!user.orgId) throw redirect(rurl)

  const org = await db.org.findUnique({
    where: { id: user.orgId },
    select: options?.select ? options.select : undefined,
  })
  if (!org || !org.weekDays) throw redirect(rurl) // @TODO: why week days?

  if (org.weekDays) {
    org.weekDays = normalizeWeekDays(org.weekDays as any) as any
  }

  return { user, org }
}
export const getServicefromSearchParams = async (
  request: Request,
  options: any = {},
) => {
  const {
    redirectURL = "/dash/servicios/nuevo",
    select = { place: true, id: true },
  } = options
  const url = new URL(request.url)
  const serviceId = url.searchParams.get("serviceId")
  if (!serviceId && redirectURL === null) return null
  if (!serviceId) throw redirect("/dash/servicios/nuevo")
  const service = await db.service.findUnique({
    where: { id: serviceId },
    select,
    // @TODO return according to API
  })
  if (!service) throw redirect("/dash/servicios/nuevo")
  return service
}

// SESSION SETTERS
const setUserSessionAndRedirect = async ({
  userId,
  redirectURL = "/dash",
  request,
}: {
  userId: string
  redirectURL?: string
  request: Request
}) => {
  const session = await getSession(request.headers.get("Cookie"))
  session.set("userId", userId)
  return redirect(redirectURL, {
    headers: { "Set-Cookie": await commitSession(session) },
  })
}

// MAGIC LINK =============================================================
export const handleMagicLinkLogin = async (token: string, request: Request) => {
  const { isValid, decoded, expired, errorMessage } = validateUserToken(token)
  const email =
    typeof decoded === "object" && decoded !== null
      ? (decoded as { email?: string }).email
      : undefined

  if (expired) {
    return {
      alert: {
        type: "error",
        message: "El link ha expirado, solicita uno nuevo",
      },
    }
  }

  const genericError = {
    alert: {
      type: "error",
      message: errorMessage || "Link inválido, solicita uno nuevo",
    },
  }
  if (!isValid || !email) return genericError

  const user = await db.user.upsert({
    where: { email },
    create: {
      email,
      emailVerified: true,
      role: "user",
    },
    update: {
      emailVerified: true, // we can verify it here
    },
  })

  if (!user) return genericError

  // Get next URL from request if available
  const url = new URL(request.url)
  const next = url.searchParams.get("next") || "/dash"

  return setUserSessionAndRedirect({
    userId: user.id,
    redirectURL: next,
    request,
  })
}

// OAUTH =============================================================
export const handleOAuthCallback = async (
  provider: string,
  code: string,
  request: Request,
) => {
  if (!isValidProvider(provider)) {
    return { alert: { type: "error", message: "Proveedor no válido" } }
  }

  const redirectUri =
    new URL(request.url).origin +
    `/signin?intent=oauth_callback&provider=${provider}`

  try {
    const oauthUser = await getOAuthUser(provider, code, redirectUri)

    const user = await db.user.upsert({
      where: { email: oauthUser.email },
      create: {
        email: oauthUser.email,
        emailVerified: true,
        displayName: oauthUser.name,
        photoURL: oauthUser.picture,
        providerId: provider,
        uid: oauthUser.id,
        role: "user",
      },
      update: {
        emailVerified: true,
        displayName: oauthUser.name || undefined,
        photoURL: oauthUser.picture || undefined,
        providerId: provider,
      },
    })

    return setUserSessionAndRedirect({ userId: user.id, request })
  } catch (error) {
    console.error(`OAuth ${provider} error:`, error)
    return { alert: { type: "error", message: `Error con ${provider}` } }
  }
}

// PUBLIC READING
export const getPublicServicesFor = async (orgId: string) => {
  return await db.service.findMany({
    where: { orgId, archived: false, isActive: true },
    include: { org: true },
  })
}

// SERVICES =====================================================================================
export const getServices = async (
  request: Request,
  includeOrg: boolean = false,
  where: Record<string, string | boolean | number> = {},
) => {
  const user = await getUserOrRedirect(request)
  if (!user.orgId) throw redirect("/signup/1")

  return await db.service.findMany({
    where: { orgId: user.orgId, archived: false, ...where },
    include: { org: includeOrg },
  })
}

export const getService = async (slug?: string) => {
  if (!slug) return null
  return await db.service.findUnique({
    where: {
      slug,
    },
  })
}

const validateWith = <T,>(data: T, schema: ZodSchema) => {
  return schema.safeParse(data)
}

const getCurrentSchema = (stepSlug: string) => {
  // Step 5: TimesForm -> weekDays
  if (stepSlug === "5") return signup3Schema
  // Step 4: BussinesTypeForm -> businessType
  if (stepSlug === "4") return signup2Schema
  // Steps 1, 2, 3: AboutYourCompanyForm -> name, shopKeeper, numberOfEmployees, address
  return signup1Schema
}

export const updateOrg = async (formData: FormData, stepSlug: string) => {
  type ORG = Signup1SchemaType | Signup2SchemaType | Signup3SchemaType

  const next = (formData.get("next") as string) || `/signup/${+stepSlug + 1}`
  const data: ORG = JSON.parse(formData.get("data") as string)
  // validation
  const result = validateWith(data, getCurrentSchema(stepSlug))
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: result.error, success: result.success, data }),
      {
        status: 400,
      },
    )
  }
  const validData = result.data as ORG
  const isLastCall = next === "/signup/4"

  // Build update data based on step
  const updateData: Record<string, unknown> = {
    isActive: !!isLastCall,
  }

  if ("name" in validData) {
    updateData.name = validData.name
    updateData.slug = `${slugify(validData.name, { lower: true })}-${nanoid(4)}`
    updateData.shopKeeper = validData.shopKeeper
    updateData.address = validData.address
    updateData.numberOfEmployees = validData.numberOfEmployees
  }
  if ("businessType" in validData) {
    updateData.businessType = validData.businessType
  }
  if ("weekDays" in validData) {
    updateData.weekDays = validData.weekDays
  }

  const actualOrg = await db.org.update({
    where: { id: validData.id },
    data: updateData,
  })
  isLastCall &&
    (await db.user.update({
      where: { id: actualOrg.ownerId },
      data: {
        orgId: actualOrg.id,
      },
    }))
  throw redirect(next)
}

export const getEvents = async (serviceId: string) => {
  return await db.event.findMany({
    where: {
      serviceId,
    },
  })
}

export const createEvent = async (data: Event) => {
  return await db.event.create({ data })
}
