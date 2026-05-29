import type { Section3 } from "@easybits.cloud/html-tailwind-generator"
import { getPublicImageUrl } from "~/utils/urls"
import { DAY_LABELS, normalizeWeekDays, WEEK_DAYS } from "~/utils/weekDays"

type OrgData = {
  name?: string | null
  description?: string | null
  logo?: string | null
  email?: string | null
  address?: string | null
  social?: Record<string, string> | null
  businessType?: string | null
  weekDays?: Record<string, unknown> | null
}

type ServiceData = {
  name: string
  slug?: string
  duration: number | bigint
  price: number | bigint
  gallery?: string[] | null
}

const HERO_IMG = "/images/cover.svg"

/**
 * Inline SVG with Tailwind classes only (no inline style — GrapesJS strips them).
 */
const ICON = {
  mail: `<svg viewBox="0 0 24 24" class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>`,
  clock: `<svg viewBox="0 0 24 24" class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`,
  chevron: `<svg viewBox="0 0 20 20" class="w-4 h-4" fill="currentColor"><path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z"></path></svg>`,
  pin: `<svg viewBox="0 0 24 24" class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z"></path><circle cx="12" cy="9" r="2.5"></circle></svg>`,
  // Social icons: filled brand glyphs from react-icons/fa6 (Font Awesome 6),
  // inlined as SVG strings because this template renders as raw HTML (no React).
  facebook: `<svg viewBox="0 0 320 512" class="w-[18px] h-[18px]" fill="currentColor"><path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z"></path></svg>`,
  linkedin: `<svg viewBox="0 0 448 512" class="w-[18px] h-[18px]" fill="currentColor"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"></path></svg>`,
  instagram: `<svg viewBox="0 0 448 512" class="w-[18px] h-[18px]" fill="currentColor"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path></svg>`,
  twitter: `<svg viewBox="0 0 512 512" class="w-[18px] h-[18px]" fill="currentColor"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path></svg>`,
  tiktok: `<svg viewBox="0 0 448 512" class="w-[18px] h-[18px]" fill="currentColor"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"></path></svg>`,
  globe: `<svg viewBox="0 0 512 512" class="w-[18px] h-[18px]" fill="currentColor"><path d="M352 256c0 22.2-1.2 43.6-3.3 64l-185.3 0c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64l185.3 0c2.2 20.4 3.3 41.8 3.3 64zm28.8-64l123.1 0c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64l-123.1 0c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32l-116.7 0c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0l-176.6 0c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0L18.6 160C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192l123.1 0c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64L8.1 320C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6l176.6 0c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352l116.7 0zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6l116.7 0z"></path></svg>`,
  youtube: `<svg viewBox="0 0 576 512" class="w-[18px] h-[18px]" fill="currentColor"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path></svg>`,
}

// Social network → brand color + icon. Keys match the `OrgSocial` Prisma type
// (the fields the owner fills in /dash/website/socialmedia).
const SOCIAL_DEFS: { key: string; bg: string; icon: string }[] = [
  { key: "facebook", bg: "bg-[#1877F2]", icon: ICON.facebook },
  { key: "instagram", bg: "bg-[#E84187]", icon: ICON.instagram },
  { key: "x", bg: "bg-[#000000]", icon: ICON.twitter },
  { key: "tiktok", bg: "bg-[#020003]", icon: ICON.tiktok },
  { key: "linkedin", bg: "bg-[#0A66C2]", icon: ICON.linkedin },
  { key: "youtube", bg: "bg-[#FF0000]", icon: ICON.youtube },
  { key: "website", bg: "bg-[#5A51F0]", icon: ICON.globe },
]

/** Prepend https:// when the owner typed a bare domain (e.g. "instagram.com/foo"). */
function normalizeSocialUrl(value: string): string {
  const v = value.trim()
  return /^https?:\/\//i.test(v) ? v : `https://${v}`
}

type ClockTime = { hr: number; min: number; mer: "a.m." | "p.m." }

/** "08:30" -> {8,30,a.m.} ; "18:00" -> {6,0,p.m.}. */
function parseClock(hhmm: string): ClockTime | null {
  const [h, m] = hhmm.split(":").map(Number)
  if (!Number.isFinite(h)) return null
  return {
    hr: h % 12 === 0 ? 12 : h % 12,
    min: Number.isFinite(m) ? m : 0,
    mer: h >= 12 ? "p.m." : "a.m.",
  }
}

function clockLabel(t: ClockTime, withMer: boolean): string {
  const base = t.min ? `${t.hr}:${String(t.min).padStart(2, "0")}` : `${t.hr}`
  return withMer ? `${base} ${t.mer}` : base
}

/** Google style: "8:30 a.m.–6:30 p.m."; same meridian collapses to "2–6 p.m.". */
function fmtRange(range: unknown): string | null {
  if (!Array.isArray(range) || range.length < 2) return null
  const open = parseClock(String(range[0]))
  const close = parseClock(String(range[1]))
  if (!open || !close) return null
  return `${clockLabel(open, open.mer !== close.mer)}–${clockLabel(close, true)}`
}

/** A day's ranges joined by ", " (e.g. split shifts), or "Cerrado". */
function fmtDayRanges(ranges: unknown): string {
  if (!Array.isArray(ranges) || ranges.length === 0) return "Cerrado"
  const parts = ranges.map(fmtRange).filter(Boolean) as string[]
  return parts.length ? parts.join(", ") : "Cerrado"
}

/**
 * Native <details> "popup" with the weekly schedule. Collapsed it shows the
 * first open day (e.g. "Lun 9am a 6pm"); on click it expands a panel listing
 * every day, always in the same order (Mon→Sun). Pure HTML/CSS — no JS, so it
 * works inside the sandboxed iframe and survives GrapesJS. Hours are baked from
 * org.weekDays; if the owner changes them, re-publishing refreshes the panel.
 */
function buildScheduleHtml(weekDays: OrgData["weekDays"]): string {
  const normalized = normalizeWeekDays(weekDays ?? undefined, true)
  const rows = WEEK_DAYS.map((d) => {
    const text = fmtDayRanges(normalized[d])
    const closed = text === "Cerrado"
    return `<div class="flex gap-4 py-1.5 text-sm"><span class="w-24 shrink-0 text-gray-700">${DAY_LABELS[d].toLowerCase()}</span><span class="${closed ? "text-gray-400" : "text-gray-600"} whitespace-nowrap">${text}</span></div>`
  }).join("")
  return `<details class="relative mb-2"><summary class="flex items-center gap-2 text-gray-700 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">${ICON.clock}<span>Horarios</span>${ICON.chevron}</summary><div class="absolute left-0 top-full z-20 mt-1 w-72 rounded-xl border border-[#efefef] bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.12)]">${rows}</div></details>`
}

export function buildDefaultSections(
  org: OrgData,
  services: ServiceData[],
): Section3[] {
  const logoUrl = getPublicImageUrl(org.logo) || "/images/avatar.svg"

  const serviceCards = services
    .map((s) => {
      const imgUrl = s.gallery?.[0] ? getPublicImageUrl(s.gallery[0]) : null
      const imgHtml = imgUrl
        ? `<img alt="cover" class="w-full h-[160px] object-cover block" src="${imgUrl}"/>`
        : `<div class="w-full h-[160px] bg-gray-100 flex items-center justify-center text-gray-300"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>`
      return `<a href="/${s.slug || "#"}" class="block no-underline text-inherit min-w-0"><div class="bg-white border border-[#efefef] rounded-2xl overflow-hidden hover:scale-95 transition-all">${imgHtml}<div class="p-4 flex justify-between items-center gap-3"><div><h3 class="text-gray-900 text-lg m-0">${s.name}</h3><p class="text-gray-400 mt-1 text-sm">${s.duration} min · $${s.price} mxn</p></div><span class="bg-gray-900 text-white rounded-full h-8 px-3 text-xs inline-flex items-center">Agendar</span></div></div></a>`
    })
    .join("")

  const contactBlock = `${org.email ? `<div class="flex items-center gap-2 text-gray-700 mb-2">${ICON.mail}<span>${org.email}</span></div>` : ""}${buildScheduleHtml(org.weekDays)}${org.address ? `<div class="flex items-center gap-2 text-gray-500 mb-2">${ICON.pin}<span>${org.address}</span></div>` : ""}`

  // Only render social icons for networks the owner actually configured.
  // Tailwind arbitrary value classes for backgrounds (inline styles are stripped by GrapesJS).
  const socials = SOCIAL_DEFS.filter((s) => {
    const value = org.social?.[s.key]
    return typeof value === "string" && value.trim().length > 0
  })
    .map((s) => {
      const url = normalizeSocialUrl(org.social![s.key] as string)
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-10 h-10 rounded-full text-white no-underline ${s.bg}">${s.icon}</a>`
    })
    .join("")

  const html = `<div class="bg-[#FDFEFF] min-h-svh flex flex-col"><img alt="cover" src="${HERO_IMG}" class="h-[300px] w-full object-cover object-center block"/><section class="-mt-[120px] px-[5%] grid grid-cols-6 gap-8 pb-12 relative z-30 flex-1"><div class="col-span-6"><div class="bg-white rounded-2xl p-8 w-full border border-[#efefef]"><img alt="company logo" class="w-[120px] h-[120px] rounded-full mb-6 object-cover block" src="${logoUrl}"/><h1 class="text-2xl font-bold m-0">${org.name || "Mi Negocio"}</h1>${org.description ? `<p class="mt-4 text-gray-500">${org.description}</p>` : ""}<div class="mt-6">${contactBlock}</div>${socials ? `<div class="mt-8 flex gap-3 flex-wrap">${socials}</div>` : ""}</div><div class="bg-white rounded-2xl p-8 w-full border border-[#efefef] mt-8"><h2 class="text-xl m-0 mb-6">Servicios</h2><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${serviceCards}</div></div></div></section><div data-denik-branding="true" data-gjs-removable="false" data-gjs-copyable="false" data-gjs-draggable="false" data-gjs-editable="false" class="w-full flex items-center justify-center gap-1 py-1 mt-auto"><span data-gjs-removable="false" data-gjs-editable="false" style="font-family:'Satoshi ',system-ui,sans-serif;color:#5158F6;font-size:14px">Powered by</span><img alt="Denik" src="https://denik.me/images/denik-logo.svg" data-gjs-removable="false" data-gjs-editable="false" data-gjs-resizable="false" style="height:32px;width:auto;display:inline-block;margin-left:4px"/></div></div>`

  return [{ id: "main", order: 0, label: "Landing completa", html }]
}
