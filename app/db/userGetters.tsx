import { Org, User } from "@prisma/client";
import { redirect } from "@remix-run/react";
import { getSession } from "~/sessions";
import { db } from "~/utils/db.server";
import { FirebaseUserData } from "~/utils/lib/firebase";

type Options = { redirectURL: string };

export const redirectIfUser = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("userId")) throw redirect("/dash");
};

export const getUserOrRedirect = async (
  request: Request,
  options: Options = { redirectURL: "/signin" }
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
  const orgs = await db.org.findMany({ where: { ownerId: user.id } }); // @TODO: only first for now
  if (!orgs || !orgs[0]) return null;
  return orgs[0];
};

export const getUserAndOrgOrRedirect = async (
  request: Request,
  options: Options = { redirectURL: "/signin" }
): Promise<{ user: User; org: Org }> => {
  const user = await getUserOrNull(request);
  if (!user?.orgId) throw redirect(options.redirectURL);
  const org = await db.org.findUnique({ where: { id: user.orgId } });
  if (!org) throw redirect(options.redirectURL);
  return { user, org };
};

// used in loaders
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

export const getServices = async (request: Request) => {
  const user = await getUserOrRedirect(request);
  if (!user.orgId) throw redirect("/signup/sobre-tu-negocio");
  return await db.service.findMany({
    where: { orgId: user.orgId },
    include: { org: true },
  });
};
