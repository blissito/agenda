import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { MOCK_BUSINESSES, type Business } from "../Community/mockBusinesses";

const normalize = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

    type CategoryTabsProps = {
      categories: string[];
      active: string;
      onChange: (category: string) => void;
    };
    
    function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
      return (
        <div className="w-full">
          <div
            className={[
              "flex items-center gap-3",
              "flex-nowrap whitespace-nowrap",
              "overflow-x-auto",
              "py-2",
              "px-2",
              "no-scrollbar",
            ].join(" ")}
          >
            {categories.map((cat) => {
              const isActive = normalize(cat) === normalize(active);
    
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onChange(cat)}
                  className={[
                    "shrink-0",
                    "px-4 py-2 rounded-full text-sm md:text-base font-semibold transition",
                    isActive
                      ? "bg-gray-100 text-brand_dark"
                      : "bg-transparent text-brand_gray hover:bg-gray-100 hover:text-brand_dark",
                  ].join(" ")}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    

function AgendaSlugBar() {
  const [slug, setSlug] = useState<string>("");
  const navigate = useNavigate();

  const goSignin = () => {
    const value = slug.trim();
    if (!value) {
      navigate("/signin");
      return;
    }
    navigate(`/signin?slug=${encodeURIComponent(value)}`);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-xl bg-white border border-brand-gray-light rounded-full px-5 py-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center flex-1 min-w-0">
          <span className="font-semibold text-brand_dark shrink-0">denik.me/</span>

          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") goSignin();
            }}
            placeholder="tunegocio"
            className="ml-2 w-full !bg-transparent !border-0 !outline-none !ring-0 focus:!ring-0 focus:!outline-none text-brand_gray placeholder:text-brand_gray/70"
          />
        </div>

        <button
          type="button"
          onClick={goSignin}
          className="bg-brand_blue text-white px-5 py-2 rounded-full text-sm md:text-base font-semibold whitespace-nowrap"
        >
          Crear mi agenda
        </button>
      </div>

      <p className="mt-3 text-xs md:text-sm text-brand_gray">Empieza a usar Deník gratis</p>
    </div>
  );
}

function BusinessCard({ business }: { business: Business }) {
  return (
    <NavLink to={`/community/${business.slug}`} className="group block">
      <div className="rounded-3xl overflow-hidden bg-white border border-brand-gray-light shadow-sm group-hover:shadow-md transition">
        <div className="aspect-square w-full bg-brand-gray-light/30 relative">
          <img
            src={business.image}
            alt={business.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="p-4 text-center">
          <h3 className="font-bold text-brand_dark">{business.name}</h3>
        </div>
      </div>
    </NavLink>
  );
}

function AnimatedItemBlur({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ animationDelay: `${index * 70}ms` }}
      className="opacity-0 translate-y-2 blur-[6px] animate-[blurReveal_520ms_ease-out_forwards]"
    >
      {children}

      <style>{`
        @keyframes blurReveal {
          from { opacity: 0; transform: translateY(8px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0px); }
        }
      `}</style>
    </div>
  );
}






export function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  const categories = useMemo(() => {
    const map = new Map<string, string>(); // norm -> label
    for (const b of MOCK_BUSINESSES) {
      const norm = normalize(b.category);
      if (!map.has(norm)) map.set(norm, b.category);
    }
    return ["Todos", ...Array.from(map.values())];
  }, []);

  const filtered = useMemo(() => {
    if (normalize(activeCategory) === normalize("Todos")) return MOCK_BUSINESSES;

    return MOCK_BUSINESSES.filter(
      (b) => normalize(b.category) === normalize(activeCategory)
    );
  }, [activeCategory]);

  return (
    <section className="pt-28 pb-16 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-brand_dark leading-tight">
          Conoce algunos <br className="hidden md:block" />
          miembros de Deník
        </h1>

        <p className="mt-5 text-brand_gray text-base md:text-lg max-w-2xl mx-auto">
          Conoce a la comunidad y encuentra servicios cercanos a tu ubicación o crea una agenda
          para tu negocio
        </p>

        <div className="mt-8">
          <AgendaSlugBar />
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12">
        <CategoryTabs categories={categories} active={activeCategory} onChange={setActiveCategory} />

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-brand_gray">
            No hay negocios en <span className="font-semibold">{activeCategory}</span>.
          </p>
        ) : (
          <div 
           key={normalize(activeCategory)}
              className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
              >
            {filtered.map((b, i) => (
  <AnimatedItemBlur key={b.id} index={i}>
    <BusinessCard business={b} />
  </AnimatedItemBlur>
))}



          </div>
        )}
      </div>
    </section>
  );
}
