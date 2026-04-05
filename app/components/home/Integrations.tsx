const INTEGRATIONS = [
  { name: "Stripe", logo: "/images/integrations/stripe.svg" },
  { name: "MercadoPago", logo: "/images/integrations/mercadopago.svg" },
  { name: "WhatsApp", logo: "/images/whatsapp.svg" },
  { name: "Google Calendar", logo: "/images/integrations/google-calendar.svg" },
  { name: "Gmail", logo: "/images/integrations/gmail.svg" },
  { name: "Instagram", logo: "/images/integrations/instagram.svg" },
  { name: "Zoom", logo: "/images/zoom.svg" },
  { name: "Google Meet", logo: "/images/google-meet.svg" },
]

export const Integrations = () => (
  <section className="max-w-[90%] xl:max-w-7xl mx-auto my-[120px] lg:my-[160px] text-center">
    <h2 className="text-3xl lg:text-5xl font-satoBold text-brand_dark">
      Más de 10 integraciones
    </h2>
    <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-16">
      {INTEGRATIONS.map((item) => (
        <div
          key={item.name}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-sm border border-brand_pale flex items-center justify-center p-3 hover:scale-110 transition-transform"
          title={item.name}
        >
          <img
            src={item.logo}
            alt={item.name}
            className="w-full h-full object-contain"
          />
        </div>
      ))}
    </div>
  </section>
)
