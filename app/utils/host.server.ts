import { db } from "~/utils/db.server";
import type { Org, Service } from "@prisma/client";

const PLATFORM_DOMAINS = ["denik.me", "localhost", "127.0.0.1"];

/**
 * Normalizes a hostname by removing port, www prefix, and converting to lowercase
 */
export function normalizeHost(host: string): string {
  return host
    .split(":")[0] // Remove port if present (e.g., domain.com:3000 -> domain.com)
    .toLowerCase() // Normalize case
    .replace(/^www\./, ""); // Remove www prefix (e.g., www.domain.com -> domain.com)
}

/**
 * Gets the real host from request headers, checking X-Forwarded-Host first (for proxies like Fly.io)
 */
export function getHostFromRequest(request: Request): string {
  // X-Forwarded-Host is set by reverse proxies (Fly.io, Cloudflare, etc.)
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    // Can be comma-separated list, take the first one
    return forwardedHost.split(",")[0].trim();
  }
  return request.headers.get("host") || "";
}

/**
 * Extracts subdomain from a denik.me host
 */
function getSubdomain(host: string): string | null {
  const normalized = normalizeHost(host);
  if (normalized.endsWith(".denik.me")) {
    const slug = normalized.split(".")[0];
    return slug && slug !== "www" ? slug : null;
  }
  return null;
}

/**
 * Checks if the host is a platform domain (denik.me, localhost, etc.)
 */
function isPlatformDomain(host: string): boolean {
  const normalized = normalizeHost(host);
  return PLATFORM_DOMAINS.some(
    (domain) => normalized === domain || normalized.endsWith(`.${domain}`)
  );
}

export type OrgWithServices = Org & { services: Service[] };

export type HostResolution =
  | { type: "landing" }
  | { type: "org"; org: OrgWithServices }
  | { type: "not_found" };

/**
 * Resolves the host for the index page
 *
 * Priority:
 * 1. Custom domain (if not a known platform domain) -> show org page
 * 2. Subdomain (orgslug.denik.me) -> show org page
 * 3. Platform domain (denik.me, www.denik.me) -> show landing page
 */
export async function resolveHostForIndex(
  request: Request
): Promise<HostResolution> {
  // Debug: log all relevant headers
  console.log("[resolveHostForIndex] Headers:", {
    host: request.headers.get("host"),
    xForwardedHost: request.headers.get("x-forwarded-host"),
    xForwardedFor: request.headers.get("x-forwarded-for"),
    flyClientIp: request.headers.get("fly-client-ip"),
    flyRequestId: request.headers.get("fly-request-id"),
  });

  const rawHost = getHostFromRequest(request);
  const host = normalizeHost(rawHost);

  console.log("[resolveHostForIndex] rawHost:", rawHost, "normalized:", host);

  const isPlatform = isPlatformDomain(host);

  // Custom domain: any domain that's not a platform domain
  if (!isPlatform && host.length > 0) {
    const org = await db.org.findUnique({
      where: { customDomain: host, customDomainStatus: "active" },
      include: { services: { where: { isActive: true, archived: false } } },
    });
    return org ? { type: "org", org } : { type: "not_found" };
  }

  // Subdomain: orgslug.denik.me
  const subdomain = getSubdomain(host);
  if (subdomain) {
    const org = await db.org.findUnique({
      where: { slug: subdomain },
      include: { services: { where: { isActive: true, archived: false } } },
    });
    return org ? { type: "org", org } : { type: "not_found" };
  }

  // Platform domain without subdomain -> landing page
  return { type: "landing" };
}

/**
 * Checks if request is from a subdomain or custom domain (not main platform)
 */
export function isOrgDomain(request: Request): boolean {
  const rawHost = getHostFromRequest(request);
  const host = normalizeHost(rawHost);

  // Check if it's a platform domain without subdomain
  const isPlatform = PLATFORM_DOMAINS.some((d) => host === d);
  console.log("[isOrgDomain] host:", host, "isPlatform:", isPlatform);
  if (isPlatform) return false;

  // Check for subdomain
  const subdomain = getSubdomain(host);
  if (subdomain) return true;

  // Check for custom domain (not a platform domain at all)
  return !isPlatformDomain(host);
}

/**
 * App routes that should be BLOCKED on org subdomains/custom domains
 * These are platform routes, not org-specific content
 */
const BLOCKED_APP_ROUTES = [
  /^\/signin/,
  /^\/signup/,
  /^\/dash/,
  /^\/api/,
  /^\/stripe/,
  /^\/auth/,
  /^\/planes/,
  /^\/demo/,
];

export function isRouteAllowedOnOrgDomain(pathname: string): boolean {
  // Block known app routes
  if (BLOCKED_APP_ROUTES.some((pattern) => pattern.test(pathname))) {
    return false;
  }
  // Allow: / (home) and /:serviceSlug (any other single-segment path)
  return true;
}

/**
 * Resolves an Org based on the request hostname or URL slug
 *
 * Priority:
 * 1. Custom domain (if not a known platform domain)
 * 2. Subdomain (orgslug.denik.me)
 * 3. URL path parameter (fallback)
 */
export async function resolveOrgFromRequest(
  request: Request,
  orgSlugParam: string | undefined
): Promise<Org | null> {
  const rawHost = getHostFromRequest(request);
  const host = normalizeHost(rawHost);

  const isPlatform = isPlatformDomain(host);

  // 1. Custom domain: any domain that's not a platform domain
  if (!isPlatform && host.length > 0) {
    return db.org.findUnique({
      where: { customDomain: host, customDomainStatus: "active" },
    });
  }

  // 2. Subdomain: orgslug.denik.me
  const subdomain = getSubdomain(host);
  if (subdomain) {
    return db.org.findUnique({ where: { slug: subdomain } });
  }

  // 3. Fallback: use orgSlug from URL path
  if (orgSlugParam) {
    return db.org.findUnique({ where: { slug: orgSlugParam } });
  }

  return null;
}
