const INTEGRATIONS = [
  { name: "Easybits", logo: "https://www.easybits.cloud/logo-purple.svg" },
  { name: "WhatsApp", logo: "/images/whatsapp.svg" },
  { name: "Google Meet", logo: "/images/google-meet.svg" },
  { name: "Zoom", logo: "/images/zoom.svg" },
  { name: "Formmy", logo: "https://www.formmy.app/dash/logo-full.svg" },
  { name: "MercadoPago", logo: "/images/illustrations/mp.svg" },
  { name: "Stripe", logo: "/images/integrations/stripe.svg" },
  { name: "AWS", logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" },
]

export const Integrations = () => (
  <section className="max-w-[90%] xl:max-w-7xl mx-auto my-[120px] lg:my-[160px] text-center">
    <style>{`
      @keyframes orbit {
        0% { transform: translateY(0px) rotate(0deg); }
        25% { transform: translateY(-6px) rotate(1.5deg); }
        50% { transform: translateY(0px) rotate(0deg); }
        75% { transform: translateY(6px) rotate(-1.5deg); }
        100% { transform: translateY(0px) rotate(0deg); }
      }
      .integration-orbit {
        animation: orbit var(--orbit-duration, 5s) ease-in-out infinite;
        animation-delay: var(--orbit-delay, 0s);
      }
    `}</style>
    <h2 className="text-3xl lg:text-5xl font-satoBold text-brand_dark">
      Más de 8 integraciones
    </h2>
    <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-16">
      {INTEGRATIONS.map((item, i) => (
        <div
          key={item.name}
          className="integration-orbit w-20 h-20 md:w-28 md:h-28 rounded-full bg-white shadow-md border border-brand_pale flex items-center justify-center p-4 md:p-5 hover:scale-110 transition-transform"
          title={item.name}
          style={{
            "--orbit-duration": `${4 + (i % 3)}s`,
            "--orbit-delay": `${i * 0.4}s`,
          } as React.CSSProperties}
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
