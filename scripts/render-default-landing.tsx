/**
 * Renders TemplateOne to static HTML string.
 * Usage: npx tsx scripts/render-default-landing.tsx
 * Output: the HTML that should be used in buildDefaultSections()
 */

import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

// Inline minimal versions of the components since we can't import React components that use client hooks

const HERO_IMG =
  "https://images.pexels.com/photos/2346216/pexels-photo-2346216.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
const LOGO_FALLBACK =
  "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"

function TemplateOneStatic({ org, services }: { org: any; services: any[] }) {
  const logoUrl = org?.logo || LOGO_FALLBACK
  return React.createElement(
    "div",
    { className: "p-0 m-0 bg-[#FDFEFF] min-h-screen" },
    // Hero
    React.createElement("div", {
      className: "h-[300px] w-full",
      style: {
        backgroundImage: `url("${HERO_IMG}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      },
    }),
    // Main grid
    React.createElement(
      "section",
      {
        className:
          "-mt-[120px] px-[5%] grid grid-cols-6 gap-8 pb-12 md:pb-12 z-30",
      },
      // Left column
      React.createElement(
        "div",
        { className: "col-span-6 xl:col-span-4" },
        // Info card
        React.createElement(
          "div",
          {
            className:
              "bg-white mx-auto rounded-2xl p-8 w-full border-[1px] border-[#EFEFEF]",
          },
          React.createElement("img", {
            alt: "company logo",
            className: "w-[120px] h-[120px] rounded-full mb-6 object-cover",
            src: logoUrl,
          }),
          React.createElement(
            "h1",
            { className: "text-2xl font-bold" },
            org?.name || "Mi Negocio",
          ),
          org?.description
            ? React.createElement(
                "p",
                { className: "mt-4 text-gray-400" },
                org.description,
              )
            : null,
          // Mobile contact
          React.createElement(
            "div",
            { className: "mt-6 block xl:hidden" },
            org?.email
              ? React.createElement(
                  "div",
                  { className: "flex items-center gap-2 text-gray-400 mb-2" },
                  React.createElement("span", null, "✉"),
                  React.createElement("p", null, org.email),
                )
              : null,
            React.createElement(
              "div",
              { className: "flex items-center gap-2 text-gray-400 mb-2" },
              React.createElement("span", null, "⏱"),
              React.createElement(
                "span",
                { className: "text-green-600" },
                "Abierto ahora",
              ),
            ),
            org?.address
              ? React.createElement(
                  "div",
                  { className: "flex items-center gap-2 text-gray-400 mb-2" },
                  React.createElement("span", null, "📍"),
                  React.createElement("p", null, org.address),
                )
              : null,
          ),
          // Social
          React.createElement(
            "div",
            { className: "mt-8 flex gap-3" },
            ...[
              { bg: "#405A94", label: "f" },
              { bg: "#3077AF", label: "in" },
              { bg: "#E84187", label: "ig" },
              { bg: "#4AA1EC", label: "𝕏" },
              { bg: "#020003", label: "tk" },
              { bg: "#5A51F0", label: "🌐" },
            ].map((s, i) =>
              React.createElement(
                "a",
                {
                  key: i,
                  href: "#",
                  className:
                    "inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold",
                  style: { backgroundColor: s.bg },
                },
                s.label,
              ),
            ),
          ),
        ),
        // Services card
        React.createElement(
          "div",
          {
            className:
              "bg-white mx-auto rounded-2xl p-8 w-full border-[1px] border-[#EFEFEF] mt-8",
          },
          React.createElement("h2", { className: "text-xl" }, "Servicios"),
          React.createElement(
            "div",
            {
              className:
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6 gap-4 gap-y-6",
            },
            ...services.map((s: any, i: number) =>
              React.createElement(
                "a",
                { key: i, href: `/${s.slug || "#"}`, className: "block" },
                React.createElement(
                  "div",
                  {
                    className:
                      "bg-white border-[1px] border-[#EFEFEF] rounded-2xl overflow-hidden hover:scale-95 transition-all cursor-pointer",
                  },
                  React.createElement("img", {
                    alt: "cover",
                    className: "w-full h-[160px] object-cover",
                    src:
                      s.image ||
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='160' fill='%23f3f4f6'%3E%3Crect width='400' height='160'/%3E%3C/svg%3E",
                  }),
                  React.createElement(
                    "div",
                    { className: "p-4 flex justify-between items-center" },
                    React.createElement(
                      "article",
                      null,
                      React.createElement(
                        "h3",
                        { className: "text-gray-900 text-lg" },
                        s.name,
                      ),
                      React.createElement(
                        "p",
                        { className: "text-gray-400 mt-1" },
                        `${s.duration} min · $${s.price} mxn`,
                      ),
                    ),
                    React.createElement(
                      "span",
                      {
                        className:
                          "bg-gray-900 rounded-full h-8 px-3 text-white text-xs flex items-center",
                      },
                      "Agendar",
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
      // Right sidebar
      React.createElement(
        "div",
        { className: "hidden xl:block xl:col-span-2 mt-[164px]" },
        org?.email
          ? React.createElement(
              "div",
              { className: "flex items-center gap-2 text-gray-400 mb-2" },
              React.createElement("span", null, "✉"),
              React.createElement("p", null, org.email),
            )
          : null,
        React.createElement(
          "div",
          { className: "flex items-center gap-2 text-gray-400 mb-2" },
          React.createElement("span", null, "⏱"),
          React.createElement(
            "span",
            { className: "text-green-600" },
            "Abierto ahora",
          ),
        ),
        org?.address
          ? React.createElement(
              "div",
              { className: "flex items-center gap-2 text-gray-400 mb-2" },
              React.createElement("span", null, "📍"),
              React.createElement("p", null, org.address),
            )
          : null,
      ),
    ),
    // Footer
    React.createElement(
      "section",
      { className: "w-full h-10 flex items-center z-0 justify-center" },
      React.createElement(
        "p",
        { className: "text-blue-500 text-sm" },
        "Powered by",
      ),
      React.createElement(
        "span",
        { className: "font-bold text-blue-600 ml-1" },
        "Denik",
      ),
    ),
  )
}

// Example data
const org = {
  name: "{{ORG_NAME}}",
  description: "{{ORG_DESCRIPTION}}",
  logo: null,
  email: "{{ORG_EMAIL}}",
  address: "{{ORG_ADDRESS}}",
}
const services = [
  {
    name: "{{SERVICE_NAME}}",
    slug: "{{SERVICE_SLUG}}",
    duration: 30,
    price: 0,
    image: null,
  },
]

const html = renderToStaticMarkup(
  React.createElement(TemplateOneStatic, { org, services }),
)

// Pretty print
console.log(html)
