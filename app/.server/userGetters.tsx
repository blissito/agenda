import { Event, Org, Prisma, User } from "@prisma/client";
import { redirect } from "@remix-run/react";
import { commitSession, getSession } from "~/sessions";
import { db } from "~/utils/db.server";
import { FirebaseUserData } from "~/utils/lib/firebase";
import { validateUserToken } from "~/utils/tokens";

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

// @TODO: validate accessToken
export const getOrCreateUser = async (firebaseUserData: FirebaseUserData) => {
  return await db.user.upsert({
    where: {
      email: firebaseUserData.email,
    },
    create: firebaseUserData,
    update: firebaseUserData,
  });
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
export const getFirstOrgOrNull = async (request: Request) => {
  const user = await getUserOrNull(request);
  if (!user) return null;
  return await db.org.findFirst({ where: { ownerId: user.id } }); // @TODO: multi orgs?
};

// used in loaders

export const getUserAndOrgOrRedirect = async (
  request: Request,
  options: { redirectURL?: string; select?: Prisma.OrgSelect } = {}
): Promise<{ user: User; org: Org }> => {
  const rurl = options?.redirectURL || "/signin";
  const user = await getUserOrNull(request);
  if (!user?.orgId) throw redirect(rurl);
  const org = await db.org.findUnique({
    where: { id: user.orgId },
    select: options && options.select ? options.select : undefined,
  });
  if (!org || !org.weekDays) throw redirect(rurl); // @TODO: why week days?

  return { user, org };
};

// export const getOrgFromLoggedUserOrRedirect = async <T,>(
//   request: Request,
//   options: {
//     select: Prisma.UserSelect;
//     redirectURL: string;
//   }
// ) => {
//   const { select, redirectURL = "/sigin" } = options || {};
//   const user = await getUserOrRedirect(request);
//   if (!user.orgId) throw redirect(redirectURL);
//   const org = await db.org.findUnique({
//     where: {
//       id: user.orgId,
//     },
//     select,
//   });
//   if (!org) throw redirect(redirectURL);
//   return org;
// };

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

// SERVICES =====================================================================================
export const getServices = async (
  request: Request,
  includeOrg: boolean = false,
  where: unknown = {}
) => {
  const user = await getUserOrRedirect(request);
  if (!user.orgId) throw redirect("/signup/sobre-tu-negocio");
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

export const updateOrg = async ({ id, ...data }: Partial<Org>) =>
  await db.org.update({ where: { id }, data });

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
