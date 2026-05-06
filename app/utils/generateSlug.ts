import { customAlphabet } from "nanoid"

// DNS-safe alphabet: lowercase letters and digits only.
// Underscores are NOT valid in HTTP hostnames (RFC 952/1123),
// so we must avoid them in slugs that become subdomains.
const slugNanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6)

export const generateSlug = (string: string, addDate: boolean = true) => {
  if (typeof string !== "string") return ""
  return (
    string
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]+/g, "") // strip underscores and any other non DNS-safe char
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "") + (addDate ? `-${slugNanoid()}` : "")
  )
}

export const generateLink = (uri: string, orgSlug: string) => {
  const url = new URL(uri)
  url.pathname = `/agenda/${orgSlug}`
  return url.toString()
}
