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

/**
 * Build default Section3[] — HTML generated from TemplateOne via renderToStaticMarkup
 * with dynamic data interpolation. This is the single source of truth for the default landing.
 */
export function buildDefaultSections(
  org: OrgData,
  services: ServiceData[],
): Section3[] {
  const logoUrl =
    getPublicImageUrl(org.logo) ||
    "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"

  const serviceCards = services
    .map((s) => {
      const imgUrl = s.gallery?.[0] ? getPublicImageUrl(s.gallery[0]) : null
      const imgHtml = imgUrl
        ? `<img alt="cover" class="w-full h-[160px] object-cover" src="${imgUrl}"/>`
        : `<div class="w-full h-[160px] bg-gray-100 flex items-center justify-center text-gray-300"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>`
      return `<a href="/${s.slug || "#"}" class="block"><div class="bg-white border-[1px] border-[#EFEFEF] rounded-2xl overflow-hidden hover:scale-95 transition-all cursor-pointer">${imgHtml}<div class="p-4 flex justify-between items-center"><article><h3 class="text-gray-900 text-lg">${s.name}</h3><p class="text-gray-400 mt-1">${s.duration} min · $${s.price} mxn</p></article><span class="bg-gray-900 rounded-full h-8 px-3 text-white text-xs flex items-center">Agendar</span></div></div></a>`
    })
    .join("")

  const contactBlock = `${org.email ? `<div class="flex items-center gap-2 text-gray-400 mb-2"><span>✉</span><p>${org.email}</p></div>` : ""}<div class="flex items-center gap-2 text-gray-400 mb-2"><span>⏱</span><span class="text-green-600">Abierto ahora</span></div>${org.address ? `<div class="flex items-center gap-2 text-gray-400 mb-2"><span>📍</span><p>${org.address}</p></div>` : ""}`

  // HTML structure from renderToStaticMarkup(TemplateOne) — exact replica
  const html = `<div class="p-0 m-0 bg-[#FDFEFF] min-h-screen"><div class="h-[300px] w-full" style="background-image:url(&quot;https://images.pexels.com/photos/2346216/pexels-photo-2346216.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=1260&amp;h=750&amp;dpr=2&quot;);background-size:cover;background-position:center"></div><section class="-mt-[120px] px-[5%] grid grid-cols-6 gap-8 pb-12 md:pb-12 z-30"><div class="col-span-6 xl:col-span-4"><div class="bg-white mx-auto rounded-2xl p-8 w-full border-[1px] border-[#EFEFEF]"><img alt="company logo" class="w-[120px] h-[120px] rounded-full mb-6 object-cover" src="${logoUrl}"/><h1 class="text-2xl font-bold">${org.name || "Mi Negocio"}</h1>${org.description ? `<p class="mt-4 text-gray-400">${org.description}</p>` : ""}<div class="mt-6 block xl:hidden">${contactBlock}</div><div class="mt-8 flex gap-3"><a href="#" class="inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold" style="background-color:#405A94">f</a><a href="#" class="inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold" style="background-color:#3077AF">in</a><a href="#" class="inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold" style="background-color:#E84187">ig</a><a href="#" class="inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold" style="background-color:#4AA1EC">𝕏</a><a href="#" class="inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold" style="background-color:#020003">tk</a><a href="#" class="inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold" style="background-color:#5A51F0">🌐</a></div></div><div class="bg-white mx-auto rounded-2xl p-8 w-full border-[1px] border-[#EFEFEF] mt-8"><h2 class="text-xl">Servicios</h2><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6 gap-4 gap-y-6">${serviceCards}</div></div></div><div class="hidden xl:block xl:col-span-2 mt-[164px]">${contactBlock}</div></section><section class="w-full h-10 flex items-center z-0 justify-center"><p class="text-blue-500 text-sm">Powered by</p><span class="font-bold text-blue-600 ml-1">Denik</span></section></div>`

  return [{ id: "main", order: 0, label: "Landing completa", html }]
}
