import slugify from "slugify";
import { db } from "./db.server";

/**
 * Generates a unique slug for a service within an org.
 * Tries clean slug first, adds -2, -3, etc. if collision.
 */
export async function generateUniqueServiceSlug(
  name: string,
  orgId: string
): Promise<string> {
  const baseSlug = slugify(name, { lower: true, strict: true });

  // Check if base slug is available
  const existing = await db.service.findFirst({
    where: { orgId, slug: baseSlug },
  });

  if (!existing) return baseSlug;

  // Find next available number
  let counter = 2;
  while (true) {
    const candidateSlug = `${baseSlug}-${counter}`;
    const exists = await db.service.findFirst({
      where: { orgId, slug: candidateSlug },
    });
    if (!exists) return candidateSlug;
    counter++;
  }
}
