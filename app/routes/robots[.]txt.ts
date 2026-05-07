export const loader = ({ request }: { request: Request }) => {
  const origin = new URL(request.url).origin
  const text = `User-agent: *
Allow: /
Disallow: /dash
Disallow: /api
Disallow: /stripe
Disallow: /auth
Disallow: /signin
Disallow: /signup
Disallow: /login
Disallow: /mercadopago

Sitemap: ${origin}/sitemap.xml
`
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
