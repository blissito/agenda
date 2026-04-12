import type { Section3 } from "@easybits.cloud/html-tailwind-generator"
import { getPublicImageUrl } from "~/utils/urls"

type OrgData = {
  name?: string | null
  description?: string | null
  logo?: string | null
  email?: string | null
  address?: string | null
  social?: Record<string, string> | null
  businessType?: string | null
}

type ServiceData = {
  name: string
  slug?: string
  duration: number | bigint
  price: number | bigint
  gallery?: string[] | null
}

const HERO_IMG =
  "https://images.pexels.com/photos/2346216/pexels-photo-2346216.jpeg?auto=compress&cs=tinysrgb&w=1260"

/**
 * Inline SVG with Tailwind classes only (no inline style — GrapesJS strips them).
 */
const ICON = {
  mail: `<svg viewBox="0 0 24 24" class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>`,
  clock: `<svg viewBox="0 0 24 24" class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`,
  pin: `<svg viewBox="0 0 24 24" class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z"></path><circle cx="12" cy="9" r="2.5"></circle></svg>`,
  facebook: `<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
  instagram: `<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
  twitter: `<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>`,
  globe: `<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"></path></svg>`,
}

export function buildDefaultSections(
  org: OrgData,
  services: ServiceData[],
): Section3[] {
  const logoUrl =
    getPublicImageUrl(org.logo) ||
    "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400"

  const serviceCards = services
    .map((s) => {
      const imgUrl = s.gallery?.[0] ? getPublicImageUrl(s.gallery[0]) : null
      const imgHtml = imgUrl
        ? `<img alt="cover" class="w-full h-[160px] object-cover block" src="${imgUrl}"/>`
        : `<div class="w-full h-[160px] bg-gray-100 flex items-center justify-center text-gray-300"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>`
      return `<a href="/${s.slug || "#"}" class="block no-underline text-inherit"><div class="bg-white border border-[#efefef] rounded-2xl overflow-hidden hover:scale-95 transition-all">${imgHtml}<div class="p-4 flex justify-between items-center gap-3"><div><h3 class="text-gray-900 text-lg m-0">${s.name}</h3><p class="text-gray-400 mt-1 text-sm">${s.duration} min · $${s.price} mxn</p></div><span class="bg-gray-900 text-white rounded-full h-8 px-3 text-xs inline-flex items-center">Agendar</span></div></div></a>`
    })
    .join("")

  const contactBlock = `${org.email ? `<div class="flex items-center gap-2 text-gray-500 mb-2">${ICON.mail}<span>${org.email}</span></div>` : ""}<div class="flex items-center gap-2 text-gray-500 mb-2">${ICON.clock}<span class="text-green-600">Abierto ahora</span></div>${org.address ? `<div class="flex items-center gap-2 text-gray-500 mb-2">${ICON.pin}<span>${org.address}</span></div>` : ""}`

  // Tailwind arbitrary value classes for backgrounds (inline styles are stripped by GrapesJS)
  const socials = [
    { bg: "bg-[#405A94]", icon: ICON.facebook },
    { bg: "bg-[#3077AF]", icon: ICON.linkedin },
    { bg: "bg-[#E84187]", icon: ICON.instagram },
    { bg: "bg-[#4AA1EC]", icon: ICON.twitter },
    { bg: "bg-[#020003]", icon: ICON.tiktok },
    { bg: "bg-[#5A51F0]", icon: ICON.globe },
  ]
    .map(
      (s) =>
        `<a href="#" class="inline-flex items-center justify-center w-10 h-10 rounded-full text-white no-underline ${s.bg}">${s.icon}</a>`,
    )
    .join("")

  const html = `<div class="bg-[#FDFEFF] min-h-screen"><img alt="cover" src="${HERO_IMG}" class="h-[300px] w-full object-cover object-center block"/><section class="-mt-[120px] px-[5%] grid grid-cols-6 gap-8 pb-12 relative z-30"><div class="col-span-6"><div class="bg-white rounded-2xl p-8 w-full border border-[#efefef]"><img alt="company logo" class="w-[120px] h-[120px] rounded-full mb-6 object-cover block" src="${logoUrl}"/><h1 class="text-2xl font-bold m-0">${org.name || "Mi Negocio"}</h1>${org.description ? `<p class="mt-4 text-gray-500">${org.description}</p>` : ""}<div class="mt-6">${contactBlock}</div><div class="mt-8 flex gap-3 flex-wrap">${socials}</div></div><div class="bg-white rounded-2xl p-8 w-full border border-[#efefef] mt-8"><h2 class="text-xl m-0 mb-6">Servicios</h2><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${serviceCards}</div></div></div></section><div data-denik-branding="true" data-gjs-removable="false" data-gjs-copyable="false" data-gjs-draggable="false" data-gjs-editable="false" class="w-full flex items-center justify-center gap-1 py-1"><span data-gjs-removable="false" data-gjs-editable="false" style="font-family:'Satoshi ',system-ui,sans-serif;color:#5158F6;font-size:14px">Powered by</span><img alt="Denik" src="https://denik.me/images/denik-logo.svg" data-gjs-removable="false" data-gjs-editable="false" data-gjs-resizable="false" style="height:32px;width:auto;display:inline-block;margin-left:4px"/></div></div>`

  return [{ id: "main", order: 0, label: "Landing completa", html }]
}
