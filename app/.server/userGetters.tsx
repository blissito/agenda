import { type Event, type Org, Prisma, type User } from "@prisma/client";
import { redirect } from "react-router";
import type { ZodSchema } from "zod";
import { commitSession, getSession } from "~/sessions";
import { db } from "~/utils/db.server";
import { validateUserToken } from "~/utils/tokens";
import {
  signup1Schema,
  signup2Schema,
  signup3Schema,
  type Signup1SchemaType,
  type Signup2SchemaType,
  type Signup3SchemaType,
} from "~/utils/zod_schemas";
import { nanoid } from "nanoid";
import slugify from "slugify";

export const redirectIfUser = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("userId")) throw redirect("/dash");
};

export const getUserOrRedirect = async (
  request: Request,
  options: { redirectURL?: string } = { redirectURL: "/signin" }
) => {
  const user = await getUserOrNull(request);
  if (!user) throw redirect(options.redirectURL);
  return user;
};

export const getUserOrNull = async (request: Request): Promise<User | null> => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("userId")) return null;
  const user = await db.user.findUnique({
    where: { id: session.get("userId") },
  });
  if (!user) return null;
  return user;
};

const ADMINS = ["fixtergeek@gmail.com", "bremin11.20.93@gmail.com"];

export const getAdminUserOrRedirect = async (
  request: Request
): Promise<User> => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("userId")) {
    throw redirect("/");
  }
  const user = (await db.user.findUnique({
    where: { email: session.get("userId") },
  })) as User;
  if (!user) {
    throw redirect("/");
  }
  if (!ADMINS.includes(user.email)) {
    throw redirect("/");
  }
  return user;
};

/**
 * Org stuff
 */
export const getOrCreateOrgOrRedirect = async (request: Request) => {
  const user = await getUserOrNull(request);
  if (!user) throw new Error("No user present");
  // if working fine
  if (user.orgId) {
    let found = await db.org.findUnique({ where: { id: user.orgId } });
    if (found) {
      return found;
    }
  }
  // Multi orgs? YES
  let exists = await db.org.findFirst({ where: { ownerId: user.id } });
  if (!exists) {
    exists = await db.org.create({
      data: {
        ownerId: user.id,
        name: "New Denik Org",
        slug: "new-denik-org-" + nanoid(4),
        email: user.email,
      },
    });
  }
  await db.user.update({
    where: { id: user.id },
    data: { orgIds: { push: exists.id }, orgId: exists.id },
  });
  if (exists.isActive) {
    throw redirect("/dash");
  }
  return exists;
};

// used in loaders

export const getUserAndOrgOrRedirect = async (
  request: Request,
  options: { redirectURL?: string; select?: Prisma.OrgSelect } = {}
): Promise<{ user: User; org: Org }> => {
  const rurl = options?.redirectURL || "/signup/1";
  const user = await getUserOrNull(request);
  if (!user?.orgId) throw redirect(rurl);

  const org = await db.org.findUnique({
    where: { id: user.orgId },
    select: options && options.select ? options.select : undefined,
  });
  if (!org || !org.weekDays) throw redirect(rurl); // @TODO: why week days?

  return { user, org };
};
export const getServicefromSearchParams = async (
  request: Request,
  options: any = {}
) => {
  const {
    redirectURL = "/dash/servicios/nuevo",
    select = { place: true, id: true },
  } = options;
  const url = new URL(request.url);
  const serviceId = url.searchParams.get("serviceId");
  if (!serviceId && redirectURL === null) return null;
  if (!serviceId) throw redirect("/dash/servicios/nuevo");
  const service = await db.service.findUnique({
    where: { id: serviceId },
    select,
    // @TODO return according to API
  });
  if (!service) throw redirect("/dash/servicios/nuevo");
  return service;
};

// SESSION SETTERS
const setUserSessionAndRedirect = async ({
  userId,
  redirectURL = "/dash",
  request,
}: {
  userId: string;
  redirectURL?: string;
  request: Request;
}) => {
  const session = await getSession(request.headers.get("Cookie"));
  session.set("userId", userId);
  return redirect(redirectURL, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
};

// MAGIC LINK =============================================================
export const handleMagicLinkLogin = async (token: string, request: Request) => {
  const { isValid, decoded: { email } = {} } = validateUserToken(token);
  // @TODO make sure expiration is working
  const genericError = {
    alert: {
      type: "error",
      message: "El link ha expirado, solicita uno nuevo",
    },
  };
  if (!isValid) return genericError;

  const user = await db.user.upsert({
    where: { email },
    create: {
      email,
      emailVerified: true,
    },
    update: {
      emailVerified: true, // we can verify it here
    },
  });

  if (!user) return genericError;

  return setUserSessionAndRedirect({
    userId: user.id,
    request,
  });
};

// PUBLIC READING
export const getPublicServicesFor = async (orgId: string) => {
  return await db.service.findMany({
    where: { orgId, archived: false, isActive: true },
    include: { org: true },
  });
};

// SERVICES =====================================================================================
export const getServices = async (
  request: Request,
  includeOrg: boolean = false,
  where: Record<string, string | boolean | number> = {}
) => {
  const user = await getUserOrRedirect(request);
  if (!user.orgId) throw redirect("/signup/1");

  return await db.service.findMany({
    where: { orgId: user.orgId, archived: false, ...where },
    include: { org: includeOrg },
  });
};

export const getService = async (slug?: string) => {
  if (!slug) return null;
  return await db.service.findUnique({
    where: {
      slug,
    },
  });
};

const validateWith = <T extends Record<string, string>>(
  data: T,
  schema: ZodSchema
) => {
  return schema.safeParse(data);
};

const getCurrentSchema = (stepSlug: string) => {
  return stepSlug === "1"
    ? signup1Schema
    : stepSlug === "2"
    ? signup2Schema
    : stepSlug === "3"
    ? signup3Schema
    : signup1Schema;
};

export const updateOrg = async (formData: FormData, stepSlug: string) => {
  type ORG = Signup1SchemaType | Signup2SchemaType | Signup3SchemaType;

  const next = (formData.get("next") as string) || "/signup/" + (+stepSlug + 1);
  const data: ORG = JSON.parse(formData.get("data") as string);
  // validation
  const {
    success,
    error,
    data: validData,
  } = validateWith<ORG>(data, getCurrentSchema(stepSlug));
  if (!success) {
    return new Response(JSON.stringify({ error, success, data }), {
      status: 400,
    });
  }
  const isLastCall = next === "/signup/4";
  const actualOrg = await db.org.update({
    where: {
      id: validData.id,
    },
    data: {
      ...validData,
      isActive: isLastCall ? true : false,
      slug: validData.name
        ? slugify(validData.name) + "_" + nanoid(4)
        : undefined,
      id: undefined,
    },
  });
  isLastCall &&
    (await db.user.update({
      where: { id: actualOrg.ownerId },
      data: {
        orgId: actualOrg.id,
      },
    }));
  throw redirect(next);
};

export const getEvents = async (serviceId: string) => {
  return await db.event.findMany({
    where: {
      serviceId,
    },
  });
};

export const createEvent = async (data: Event) => {
  return await db.event.create({ data });
};
