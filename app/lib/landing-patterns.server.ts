/**
 * Material destilado del skill `html_generator` (rescatado del grupo `potentia`,
 * 2026-05-10). El skill original era para slides 1920×1080 vía EasyBits MCP;
 * acá portamos solo lo que aplica a landings responsive: reglas de contraste,
 * espacio, tipografía por audiencia, catálogo de patrones de layout, bug catalog
 * y reglas de imagen.
 *
 * No portamos: workflow MCP, tamaños fijos en px, share links, document model
 * de EasyBits. Esos viven en el skill original si algún día implementamos modo
 * "presentación".
 *
 * `LANDING_PATTERN_REFERENCE_HTML` conserva los HTML literales 1920×1080 sin
 * modificar — son referencia estructural; el generador adapta su composición a
 * secciones responsive (375/768/1280) cuando los usa como inspiración.
 */

// ==================== HARD RULES ====================

export const HARD_RULES = `Reglas duras (no excepciones):
- Todo texto en español: headlines, labels, CTAs, footers, microcopy. Aunque el negocio sea técnico o el nombre esté en inglés.
- NUNCA hex hardcodeados en class o style atributos. Solo tokens semánticos del brandkit (ver tabla de tokens).
- TODAS las <img> llevan crossorigin="anonymous" y src directo a URL de Pexels o S3. NUNCA data-image-query (el renderer no lo resuelve y la imagen queda vacía).
- NUNCA wrappear HTML en CDATA — el ]]> queda visible y el CSS se rompe.
- bg-surface-alt NO es un fondo oscuro: es una tinta clara del primary (~8-10% opacity). Para paneles oscuros usar bg-primary.
- Tokens inventados (text-primary-light, bg-primary-dark, etc.) NO existen — el renderer los ignora silenciosamente.`

// ==================== SEMANTIC TOKENS ====================

export const SEMANTIC_TOKENS = `Tokens semánticos canónicos (resuelven contra el brandkit, sobreviven brandkit swap sin regenerar):

| Token                       | Uso correcto                                                              |
|-----------------------------|---------------------------------------------------------------------------|
| bg-primary / text-on-primary| Panel sólido de color + texto blanco/contrastado encima                   |
| bg-surface / text-on-surface| Fondo claro + texto oscuro principal                                      |
| bg-surface-alt              | Variación sutil de surface (tinta clara), NUNCA para paneles oscuros     |
| text-primary                | SOLO para labels uppercase pequeños (≤15px), iconos, separadores         |
| text-accent                 | SOLO decorativo (líneas, dots), NUNCA para texto legible                 |
| text-on-surface-muted       | Body con contraste reducido sobre surface (token NATIVO del SDK; preferido sobre /75) |
| text-on-surface/75          | Body sobre claro (~5.1:1, WCAG AA) — equivalente a -muted en Tailwind moderno |
| text-on-surface/55          | Footer / caption / metadata (límite decorativo aceptable)                |
| text-on-surface/40          | Puramente decorativo, máximo permitido                                   |
| bg-primary/10, bg-primary/20| Tintes suaves del color primario para fondos sutiles                     |
| border-primary/40           | Bordes de acento                                                         |
| border-on-surface/10        | Separadores sutiles entre secciones o cards                              |`

// ==================== CONTRAST RULES ====================

export const CONTRAST_RULES = `Reglas duras de contraste (lecciones de batches reales):
- text-primary NUNCA sobre fondo claro si el primary es pastel (lavanda, coral, mint). Contraste cae a ~2:1 y falla WCAG. Usa text-on-surface.
- Stats/números grandes sobre fondo de color → SIEMPRE blanco puro o negro puro. NUNCA un tinte/sombra del color de fondo (ej: número crema sobre coral = invisible). Coral o mint o azul saturado → blanco. Cream o pastel claro → negro.
- Cards con bg de color (coral #FF6B6B, mint #06D6A0, lavanda) → texto interior blanco puro. Cards con bg cream/light → texto negro.
- Cualquier text-on-surface/X con X < 70 sobre blanco produce grises que fallan WCAG AA (~2.3:1 a /50). Para body usa /75 mínimo, idealmente sin opacity.
- Un elemento de alto contraste por sección (negro/blanco puro) ancla visualmente. No diluyas todo en grises medios.
- Headlines sobre fotos: siempre con overlay/gradient (mínimo rgba(0,0,0,0.55) en la zona del texto) o con backdrop-blur en panel.`

// ==================== SPACE & LAYOUT ====================

export const SPACE_RULES = `Reglas de espacio y composición:
- Splits asimétricos (58/42, 60/40, 55/45) son más interesantes y sofisticados que 50/50. Default a asimétrico.
- Whitespace generoso > contenido comprimido. Si caben 5 bullets, pon 3. Si caben 4 cards, pon 3 grandes o 2 dominantes.
- Un solo elemento dominante por sección (stat enorme, headline masiva, imagen full-bleed) > varios elementos medianos compitiendo.
- Layouts que FALLAN (no usar):
  · Grid de 3 columnas iguales con 3 cards idénticas → corporate/genérico/aburrido.
  · Headline + 5 o más bullets en lista vertical → nunca premium.
  · Fondo blanco liso sin gradiente, textura, o elemento visual de apoyo → flat/sin identidad.
  · Sección con flex y items-end sin justify-between → mitad superior queda vacía.
  · Containers de filas sin flex-1 + justify-between → no llenan altura disponible.
- Layouts que FUNCIONAN:
  · Split dark/light asimétrico con headline dominante en un lado + soporte/imagen en el otro.
  · Full-bleed con un solo stat gigante o headline gigante y muy poco texto.
  · Bento con cards de tamaño variable (1×1, 2×1, 1×2 mezclados), nunca uniforme.
  · Hero con foto a sangre + gradiente ascendente + headline base.`

// ==================== TYPOGRAPHY BY AUDIENCE ====================

export const TYPO_BY_AUDIENCE = `Selección de tipografía por audiencia (decide en función del negocio):

· Millennial / friendly (lifestyle, wellness, food, retail casual):
  Fonts: Plus Jakarta Sans, DM Sans, Poppins. Inter es seguro pero sin personalidad.
  Paleta: coral (#FF6B6B), lavanda suave, mint (#06D6A0), warm cream.
  Layout: bento asimétrico, cards rounded (radius medio-alto).
  Mood: warm, vibrant, aspiracional sin corporativismo.
  Referencias visuales: Notion, Headspace, Canva, Oatly.

· Editorial / premium (consultoría, lujo, B2B alto, cultura):
  Fonts: DM Serif Display o Cormorant Garamond. NUNCA Playfair Display en dark (se ve genérico).
  Layout: split asimétrico, reglas tipográficas, mucho espacio negativo, sin clipart.
  Mood: dark o light extremo (nunca intermedio gris).
  Referencias: The Economist, FT, Monocle, Le Monde.

· Tech / producto (SaaS, dev tools, agencia digital, startup):
  Fonts: Space Grotesk, Syne. Nunca Roboto ni fonts de sistema.
  Layout: proceso vertical numerado, bento con stats, oversized headline.
  Mood: dark con acento neón o monocromático con un color saturado.
  Referencias: Linear, Vercel, Stripe, Arc.

Regla: una sola familia tipográfica por sección es más sofisticado que mezclar 3. Una para heading + una para body es el máximo.
Mínimos de headline en hero: 56px en mobile, 96-120px en desktop.`

// ==================== LAYOUT PATTERNS ====================

export type LandingPatternTier = "S" | "A" | "B"

export interface LandingPattern {
  id: string
  name: string
  tier: LandingPatternTier
  useCase: string
  recipe: string
}

/**
 * 11 patrones del skill + Hex Event variant. El recipe describe la estructura
 * compositiva sin ataduras a 1920×1080; el HTML literal de referencia vive en
 * `LANDING_PATTERN_REFERENCE_HTML`.
 */
export const LANDING_PATTERNS: LandingPattern[] = [
  {
    id: "P-01",
    name: "Full-Bleed Cinematic",
    tier: "S",
    useCase: "Hero principal, opener de sección de alto impacto",
    recipe:
      "Foto fullbleed (object-cover) + gradiente ascendente oscuro (rgba(0,0,0,0.9)→0 hacia arriba). Tag pill arriba con borde semi-transparente. Headline negro/black weight + acento de color en última palabra, anclado a la base. Subtítulo light opacity 65%, max-width 600px.",
  },
  {
    id: "P-02",
    name: "Bento Grid Asimétrico",
    tier: "S",
    useCase: "Features, KPIs, overview de proyecto, servicios",
    recipe:
      "Grid 3col×2row con celdas variables: imagen ancla 2fr×2row con overlay base, panel bg-primary con stat grande (88px font-black text-on-primary), imagen small 1×1, card bg-surface con copy corto, panel oscuro con stat secundario sobre imagen oscurecida (opacity 0.5). Gap 16px, border-radius 20px en cada celda.",
  },
  {
    id: "P-03",
    name: "Split Hero 55/45",
    tier: "S",
    useCase: "Producto, persona, propuesta de valor principal",
    recipe:
      "Flex horizontal 55%/45%. Izquierda bg-surface con label uppercase text-primary, headline gigante text-on-surface con span text-primary en última palabra, subtítulo opacity 65%, dos CTAs (primario bg-primary rounded-full + secundario outline). Derecha imagen a sangre object-cover sin margen.",
  },
  {
    id: "P-04",
    name: "Gradient Lateral",
    tier: "S",
    useCase: "Eventos, anuncios, lanzamientos con foto de contexto",
    recipe:
      "Foto fullbleed + gradiente lateral izq→der (rgba(0,0,0,0.9) en 0%, 0.4 en 60%, transparent en 85%). Texto en zona izquierda (60% width): label uppercase, headline 100px+ blanco con span text-on-primary acento, línea decorativa h-[2px] w-12 + detalle en text light, CTA bg-primary rounded-full.",
  },
  {
    id: "P-05",
    name: "Dark Asimétrico",
    tier: "A",
    useCase: "Showcase de proyectos, portafolio oscuro, galería con identidad",
    recipe:
      "Background near-black (#0D0D14). Imagen con clip-path:polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%) en zona top-right (~860×720). Línea divisoria bottom 1px white/10. Headline 96px white anclado bottom-left con max-width 800px. Número decorativo gigante (120px) opacity 0.05 en top-right como ghost. Brand label uppercase opacity 0.35 en top-left.",
  },
  {
    id: "P-06",
    name: "Glassmorphism",
    tier: "A",
    useCase: "Servicios o features sobre contexto visual rico",
    recipe:
      "Foto fullbleed + overlay rgba(0,0,0,0.35). Panel centrado glass: background rgba(255,255,255,0.13) + backdrop-filter blur(28px) + border 1px white/28 + box-shadow profundo. Width ~820px, padding 64×56. Label uppercase + headline 72px + subtítulo + CTA dual.",
  },
  {
    id: "P-07",
    name: "Magazine Editorial",
    tier: "A",
    useCase: "Agenda, tabla de contenidos, listado de artículos o sub-servicios",
    recipe:
      "Flex horizontal con imagen ancla 55% (con overlay base + label + título portada blanco) + 1px divisor + zona derecha con grid 2×2: cada celda alterna copy (categoría uppercase text-primary + título 30px + descripción opacity 55) e imagen. Bordes internos 1px black/8.",
  },
  {
    id: "P-08",
    name: "Diagonal Angular",
    tier: "A",
    useCase: "Intro de sección, separador visual, transición temática",
    recipe:
      "bg-surface base. Imagen con clip-path:polygon(38% 0%, 100% 0%, 100% 100%, 22% 100%) en zona derecha. Gradiente lateral suave para fundir border. Texto en zona izquierda (45% width): label, headline 96px text-on-surface en 3 líneas, subtítulo opacity 60%, CTA pill.",
  },
  {
    id: "P-09",
    name: "Oversized Typography",
    tier: "A",
    useCase: "Manifiesto, cita de impacto, transición de capítulo",
    recipe:
      "Background near-black (#0A0A0A). Ghost word gigante (300px, opacity 0.025) absolute en top-left como textura. Label uppercase text-on-primary. Headline 165px font-black en 3 líneas con tercera línea text-on-primary como acento. Línea decorativa + tagline opacity 0.45.",
  },
  {
    id: "P-10",
    name: "Masonry Ancla",
    tier: "S",
    useCase: "Galería de resultados, evidencia visual, portafolio mixto",
    recipe:
      "bg-surface, padding 12px, gap 12px. Imagen ancla rounded-2xl 55% width con overlay base + título 52px white. Zona derecha grid 2×2: 3 celdas imagen rounded-2xl + 1 celda bg-primary con stat 72px font-black text-on-primary + label + contexto.",
  },
  {
    id: "P-11",
    name: "Dribbble Photo Mosaic",
    tier: "S",
    useCase: "Cierre, galería visual-first, sección de portafolio",
    recipe:
      "Grid 4col×2row con gap 12px y padding 12px. Columnas 1 y 3 con row-span-2 (fotos altas), columnas 2 y 4 con 2 fotos cada una (4 horizontales). Doble overlay: gradiente izq→der (rgba(0,0,0,0.82) en 25% derecha) + abajo→arriba (rgba(0,0,0,0.6) en base 40%). Headline 100px font-black bottom-right alineado a la derecha con tagline + línea decorativa.",
  },
  {
    id: "HEX-01",
    name: "Hex Event (variante aprobada)",
    tier: "S",
    useCase: "Convocatoria/evento con foto de persona, alta personalidad",
    recipe:
      "bg-primary con dot-grid sutil (rgba(0,0,0,0.12) 1px, 50px spacing) + gradiente ambient solo lado izquierdo (radial-gradient ellipse 1400px×900px at 10% 50% rgba(0,0,0,0.28)). Texto izquierda 56% width con headline uppercase 64px text-on-primary letter-spacing -0.01em. Hexágono derecha 500×578px (ratio √3/2): borde brillo (clip-path hex + filter brightness 1.9 saturate 1.2) + foto con inset 3% mismo clip-path + object-position top center.",
  },
]

// ==================== PATTERN SELECTION ====================

export const PATTERNS_BY_BUSINESS_TYPE: Record<string, string[]> = {
  // Mapeable a businessType de la org. Las claves son hints, no estricto.
  agencia: ["P-01", "P-03", "P-07", "P-05", "P-11"],
  consultoria: ["P-03", "P-07", "P-09", "P-04", "P-01"],
  saas: ["P-03", "P-02", "P-06", "P-04", "P-10"],
  producto: ["P-03", "P-02", "P-06", "P-04", "P-10"],
  evento: ["P-01", "P-04", "P-09", "P-08", "P-11", "HEX-01"],
  showcase: ["P-11", "P-10", "P-07", "P-05", "P-01"],
  default: ["P-01", "P-03", "P-02", "P-10", "P-11"],
}

// ==================== BUG CATALOG ====================

export const PATTERN_BUGS = `Bug catalog — patrones que fallaron en producción (NO repetir):
- data-image-query en <img> → renderer no lo resuelve, src queda vacío. Usa siempre URL directa.
- items-end en flex sin justify-between → mitad superior del contenedor queda vacía.
- Container de filas sin flex-1 justify-between → contenido se apila arriba sin llenar altura.
- CDATA wrapper en HTML → ]]> queda visible como texto y el CSS no carga.
- Headline anclado a una esquina sin contraparte (top-left solo) → genera espacio vacío grotesco. Usa justify-between o ancla un elemento decorativo en la esquina opuesta.
- Layouts "creativos" sin referencia probada (manifesto/magazine/bignumbers genéricos) → rechazados consistentemente. Mejor adaptar un patrón aprobado que improvisar.
- Mockup cards con position:absolute en panel flex con overflow:hidden → se recortan o quedan flotando con vacío central. Usa grid o flex con gap controlado.
- Dot-grid con opacity baja sobre bg muy oscuro → casi invisible, no aporta. Para bg oscuro saturado (primary) usar opacity 0.12 mínimo.`

// ==================== PEXELS RULES ====================

export const PEXELS_RULES = `Imágenes (Pexels o S3):
- Patrón URL: https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w={width}&h={height}&fit=crop
- Ajusta w y h en la query string al ratio que necesitas (1920×1080, 600×700 retrato, 800×600 horizontal, etc.).
- TODAS las <img> llevan crossorigin="anonymous". Sin esto, exportar a imagen falla en algunos renderers.
- NUNCA data-image-query — se queda en el HTML como atributo sin efecto.
- Para fotos de persona: object-position:top center para evitar que recorte la cabeza.`

/** URLs de Pexels validadas (probadas en producción del skill original). */
export const PEXELS_VALIDATED = [
  {
    id: "P01",
    desc: "Ciudad nocturna / arquitectura dramática",
    url: "https://images.pexels.com/photos/2310713/pexels-photo-2310713.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  },
  {
    id: "P02",
    desc: "Interior moderno / diseño de interiores",
    url: "https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  },
  {
    id: "P03",
    desc: "Workspace creativo / escritorio",
    url: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
  },
  {
    id: "P04",
    desc: "Retrato profesional mujer (ideal para hex/portrait)",
    url: "https://images.pexels.com/photos/4974920/pexels-photo-4974920.jpeg?auto=compress&cs=tinysrgb&w=600&h=700&fit=crop",
  },
  {
    id: "P05",
    desc: "Equipo trabajando / colaboración",
    url: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
  },
  {
    id: "P06",
    desc: "Laptop / código / tech",
    url: "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
  },
  {
    id: "P07",
    desc: "Arquitectura / edificio angular",
    url: "https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  },
  {
    id: "P08",
    desc: "Abstracto / textura gradiente",
    url: "https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
  },
  {
    id: "P09",
    desc: "Diseño gráfico / creative work",
    url: "https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
  },
] as const

// ==================== REFERENCE HTML (1920×1080, no se inyecta por default) ====================

/**
 * HTML literal de cada patrón, tal como vino del skill (1920×1080 fijo).
 * Conservado intacto como referencia estructural — no se inyecta al prompt
 * por default (gastaría tokens y los anchos fijos no aplican a responsive).
 * Disponible para futuras features (modo "presentación" o inspiración manual).
 */
export const LANDING_PATTERN_REFERENCE_HTML: Record<string, string> = {
  "P-01": `<section class="w-[1920px] h-[1080px] overflow-hidden relative" style="font-family:'Space Grotesk',sans-serif;">
  <img src="[URL_FONDO]" class="absolute inset-0 w-full h-full object-cover" crossorigin="anonymous" />
  <div class="absolute inset-0" style="background:linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.0) 80%);"></div>
  <div class="absolute top-[80px] left-[90px]">
    <span class="text-[13px] font-bold uppercase tracking-[0.18em] text-white px-5 py-2 rounded-full border" style="border-color:rgba(255,255,255,0.35);">[LABEL]</span>
  </div>
  <div class="absolute bottom-[80px] left-[90px] right-[90px]">
    <h1 class="text-[120px] font-black text-white leading-[0.88]" style="letter-spacing:-0.03em;">[HEADLINE]<br/><span class="text-on-primary">[ACENTO].</span></h1>
    <p class="text-[22px] text-white mt-6 font-light" style="opacity:0.65; max-width:600px;">[SUBTÍTULO]</p>
  </div>
</section>`,
  "P-02": `<section class="w-[1920px] h-[1080px] overflow-hidden bg-surface" style="font-family:'Space Grotesk',sans-serif; padding:24px;">
  <div style="display:grid; grid-template-columns:2fr 1fr 1fr; grid-template-rows:1fr 1fr; gap:16px; height:100%;">
    <div style="grid-column:1; grid-row:1/span 2; border-radius:20px; overflow:hidden; position:relative;">
      <img src="[URL_ANCLA]" class="w-full h-full object-cover" crossorigin="anonymous" />
      <div class="absolute bottom-0 left-0 right-0 p-8" style="background:linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 100%);">
        <p class="text-[13px] uppercase tracking-widest text-white mb-2" style="opacity:0.7;">[LABEL_ANCLA]</p>
        <h3 class="text-[40px] font-black text-white leading-tight">[TITULO_ANCLA]</h3>
      </div>
    </div>
    <div class="bg-primary flex flex-col justify-between p-8" style="grid-column:2; grid-row:1; border-radius:20px;">
      <p class="text-[13px] uppercase tracking-widest text-on-primary" style="opacity:0.65;">[LABEL_STAT1]</p>
      <div>
        <p class="text-[88px] font-black text-on-primary leading-none">[NUMERO1]</p>
        <p class="text-[18px] text-on-primary mt-2" style="opacity:0.7;">[CONTEXTO1]</p>
      </div>
    </div>
    <div style="grid-column:3; grid-row:1; border-radius:20px; overflow:hidden;">
      <img src="[URL_SMALL1]" class="w-full h-full object-cover" crossorigin="anonymous" />
    </div>
    <div class="flex flex-col justify-between p-8 bg-surface" style="grid-column:2; grid-row:2; border-radius:20px; border:1.5px solid rgba(0,0,0,0.08);">
      <p class="text-[13px] uppercase tracking-widest text-primary font-bold">[LABEL_COPY]</p>
      <p class="text-[24px] font-semibold text-on-surface leading-snug">[COPY_CORTO]</p>
    </div>
    <div style="grid-column:3; grid-row:2; border-radius:20px; overflow:hidden; position:relative; background:#0D0D14;">
      <img src="[URL_SMALL2]" class="w-full h-full object-cover" crossorigin="anonymous" style="opacity:0.5;" />
      <div class="absolute inset-0 flex flex-col justify-end p-8">
        <p class="text-[13px] uppercase tracking-widest text-white mb-2" style="opacity:0.6;">[LABEL_STAT2]</p>
        <p class="text-[72px] font-black text-white leading-none">[NUMERO2]</p>
      </div>
    </div>
  </div>
</section>`,
  "P-03": `<section class="w-[1920px] h-[1080px] overflow-hidden flex" style="font-family:'Space Grotesk',sans-serif;">
  <div class="flex flex-col justify-center bg-surface px-[110px]" style="width:55%;">
    <span class="text-[13px] uppercase tracking-[0.18em] text-primary font-bold mb-6">[LABEL]</span>
    <h1 class="text-[88px] font-black text-on-surface leading-[0.92]" style="letter-spacing:-0.025em;">[LINEA1]<br/>[LINEA2]<br/><span class="text-primary">[LINEA3].</span></h1>
    <p class="text-[21px] text-on-surface mt-8 leading-relaxed" style="opacity:0.65; max-width:480px;">[SUBTÍTULO]</p>
    <div class="flex gap-4 mt-10">
      <div class="px-8 py-4 bg-primary text-on-primary rounded-full text-[17px] font-semibold">[CTA_PRIMARIO]</div>
      <div class="px-8 py-4 rounded-full text-[17px] font-semibold text-on-surface" style="border:1.5px solid rgba(0,0,0,0.15);">[CTA_SECUNDARIO]</div>
    </div>
  </div>
  <div class="overflow-hidden" style="width:45%;">
    <img src="[URL_IMAGEN]" class="w-full h-full object-cover" crossorigin="anonymous" />
  </div>
</section>`,
  "P-04": `<section class="w-[1920px] h-[1080px] overflow-hidden relative" style="font-family:'Space Grotesk',sans-serif;">
  <img src="[URL_FONDO]" class="absolute inset-0 w-full h-full object-cover" crossorigin="anonymous" />
  <div class="absolute inset-0" style="background:linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.82) 35%, rgba(0,0,0,0.4) 60%, transparent 85%);"></div>
  <div class="absolute inset-y-0 left-0 flex flex-col justify-center px-[100px]" style="width:60%;">
    <span class="text-[13px] uppercase tracking-[0.18em] text-on-primary font-bold mb-8" style="opacity:0.6;">[LABEL]</span>
    <h1 class="text-[100px] font-black text-white leading-[0.9]" style="letter-spacing:-0.03em;">[LINEA1]<br/>[LINEA2]<br/><span class="text-on-primary">[LINEA3].</span></h1>
    <div class="flex items-center gap-5 mt-8">
      <div class="h-[2px] w-12 bg-white" style="opacity:0.4;"></div>
      <p class="text-[22px] text-white font-light" style="opacity:0.65;">[DETALLE]</p>
    </div>
    <div class="mt-10">
      <div class="inline-block px-8 py-4 bg-primary text-on-primary rounded-full text-[17px] font-semibold">[CTA]</div>
    </div>
  </div>
</section>`,
  "P-05": `<section class="w-[1920px] h-[1080px] overflow-hidden relative" style="font-family:'Space Grotesk',sans-serif; background:#0D0D14;">
  <div class="absolute" style="top:0; right:0; width:860px; height:720px; clip-path:polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%); overflow:hidden;">
    <img src="[URL_IMAGEN]" class="w-full h-full object-cover" crossorigin="anonymous" style="object-position:top center;" />
    <div class="absolute inset-0" style="background:linear-gradient(to left, transparent 50%, rgba(13,13,20,0.75) 100%);"></div>
  </div>
  <div class="absolute left-[90px] right-[90px]" style="bottom:80px; height:1px; background:rgba(255,255,255,0.1);"></div>
  <div class="absolute bottom-[110px] left-[90px]">
    <div class="flex items-center gap-4 mb-8">
      <span class="text-[12px] uppercase tracking-[0.2em] text-white" style="opacity:0.4;">[NUMERO] / [CATEGORIA]</span>
      <div class="w-8 h-[1px] bg-white" style="opacity:0.2;"></div>
    </div>
    <h1 class="text-[96px] font-black text-white leading-[0.9]" style="letter-spacing:-0.03em; max-width:800px;">[HEADLINE]</h1>
  </div>
  <div class="absolute top-[80px] left-[90px]">
    <span class="text-[13px] uppercase tracking-[0.18em] text-white font-semibold" style="opacity:0.35;">[BRAND]</span>
  </div>
  <div class="absolute" style="top:80px; right:90px;">
    <span class="text-[120px] font-black text-white" style="opacity:0.05; letter-spacing:-0.05em; line-height:1;">[NUMERO]</span>
  </div>
</section>`,
  "P-06": `<section class="w-[1920px] h-[1080px] overflow-hidden relative" style="font-family:'Space Grotesk',sans-serif;">
  <img src="[URL_FONDO]" class="absolute inset-0 w-full h-full object-cover" crossorigin="anonymous" />
  <div class="absolute inset-0" style="background:rgba(0,0,0,0.35);"></div>
  <div class="absolute inset-0 flex items-center justify-center">
    <div class="rounded-3xl px-16 py-14" style="width:820px; background:rgba(255,255,255,0.13); backdrop-filter:blur(28px); -webkit-backdrop-filter:blur(28px); border:1px solid rgba(255,255,255,0.28); box-shadow:0 32px 72px rgba(0,0,0,0.35);">
      <span class="text-[13px] uppercase tracking-[0.18em] text-white font-bold mb-6 block" style="opacity:0.7;">[LABEL]</span>
      <h2 class="text-[72px] font-black text-white leading-[0.92]" style="letter-spacing:-0.025em;">[HEADLINE]</h2>
      <p class="text-[20px] text-white mt-6 leading-relaxed" style="opacity:0.78; max-width:560px;">[SUBTÍTULO]</p>
      <div class="flex gap-4 mt-10">
        <div class="px-7 py-3.5 bg-primary text-on-primary rounded-full text-[16px] font-semibold">[CTA1]</div>
        <div class="px-7 py-3.5 rounded-full text-[16px] font-semibold text-white" style="border:1px solid rgba(255,255,255,0.45);">[CTA2]</div>
      </div>
    </div>
  </div>
</section>`,
  "P-07": `<section class="w-[1920px] h-[1080px] overflow-hidden flex bg-surface" style="font-family:'Space Grotesk',sans-serif;">
  <div class="overflow-hidden relative flex-shrink-0" style="width:55%;">
    <img src="[URL_ANCLA]" class="w-full h-full object-cover" crossorigin="anonymous" />
    <div class="absolute bottom-0 left-0 right-0 p-10" style="background:linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 70%);">
      <p class="text-[13px] uppercase tracking-[0.15em] text-white mb-3" style="opacity:0.65;">[LABEL_PORTADA]</p>
      <h2 class="text-[56px] font-black text-white leading-[0.95]">[TITULO_PORTADA]</h2>
    </div>
  </div>
  <div class="w-[1px] self-stretch my-10 flex-shrink-0" style="background:rgba(0,0,0,0.1);"></div>
  <div class="flex-1 flex flex-col">
    <div class="flex-1 flex" style="border-bottom:1px solid rgba(0,0,0,0.08);">
      <div class="flex-1 flex flex-col justify-between p-10" style="border-right:1px solid rgba(0,0,0,0.08);">
        <span class="text-[12px] uppercase tracking-[0.15em] text-primary font-bold">[CATEGORIA1]</span>
        <div>
          <h3 class="text-[30px] font-black text-on-surface leading-[1.0] mb-3">[TITULO1]</h3>
          <p class="text-[16px] text-on-surface leading-relaxed" style="opacity:0.55;">[DESC1]</p>
        </div>
      </div>
      <div class="flex-1 overflow-hidden">
        <img src="[URL_ART1]" class="w-full h-full object-cover" crossorigin="anonymous" />
      </div>
    </div>
    <div class="flex-1 flex">
      <div class="flex-1 overflow-hidden">
        <img src="[URL_ART2]" class="w-full h-full object-cover" crossorigin="anonymous" />
      </div>
      <div class="flex-1 flex flex-col justify-between p-10" style="border-left:1px solid rgba(0,0,0,0.08);">
        <span class="text-[12px] uppercase tracking-[0.15em] text-primary font-bold">[CATEGORIA2]</span>
        <div>
          <h3 class="text-[30px] font-black text-on-surface leading-[1.0] mb-3">[TITULO2]</h3>
          <p class="text-[16px] text-on-surface leading-relaxed" style="opacity:0.55;">[DESC2]</p>
        </div>
      </div>
    </div>
  </div>
</section>`,
  "P-08": `<section class="w-[1920px] h-[1080px] overflow-hidden relative bg-surface" style="font-family:'Space Grotesk',sans-serif;">
  <div class="absolute inset-0" style="clip-path:polygon(38% 0%, 100% 0%, 100% 100%, 22% 100%); overflow:hidden;">
    <img src="[URL_IMAGEN]" class="w-full h-full object-cover" crossorigin="anonymous" />
    <div class="absolute inset-0" style="background:linear-gradient(to right, rgba(245,245,245,0.6) 0%, transparent 25%);"></div>
  </div>
  <div class="absolute inset-y-0 left-0 flex flex-col justify-center px-[90px]" style="width:45%;">
    <span class="text-[12px] uppercase tracking-[0.2em] text-primary font-bold mb-8">[LABEL]</span>
    <h1 class="text-[96px] font-black text-on-surface leading-[0.9]" style="letter-spacing:-0.025em;">[LINEA1]<br/>[LINEA2]<br/>[LINEA3].</h1>
    <p class="text-[20px] text-on-surface mt-8 leading-relaxed" style="opacity:0.6; max-width:380px;">[SUBTÍTULO]</p>
    <div class="mt-10">
      <div class="inline-block px-8 py-4 bg-primary text-on-primary rounded-full text-[17px] font-semibold">[CTA]</div>
    </div>
  </div>
</section>`,
  "P-09": `<section class="w-[1920px] h-[1080px] overflow-hidden relative" style="font-family:'Space Grotesk',sans-serif; background:#0A0A0A;">
  <div class="absolute" style="top:-20px; left:-20px; font-size:300px; font-weight:900; color:rgba(255,255,255,0.025); line-height:1; letter-spacing:-0.04em; white-space:nowrap; pointer-events:none;">[GHOST_WORD]</div>
  <div class="absolute inset-0 flex flex-col justify-center px-[100px]">
    <span class="text-[13px] uppercase tracking-[0.2em] text-on-primary font-bold mb-10" style="opacity:0.75;">[LABEL]</span>
    <h1 style="font-size:165px; font-weight:900; line-height:0.84; letter-spacing:-0.04em;">
      <span class="text-white">[LINEA1]</span><br/>
      <span class="text-white">[LINEA2]</span><br/>
      <span class="text-on-primary">[LINEA3].</span>
    </h1>
    <div class="flex items-center gap-6 mt-14">
      <div class="w-16 h-[2px] bg-white" style="opacity:0.25;"></div>
      <p class="text-[22px] text-white font-light" style="opacity:0.45;">[TAGLINE]</p>
    </div>
  </div>
</section>`,
  "P-10": `<section class="w-[1920px] h-[1080px] overflow-hidden flex gap-3 p-3 bg-surface" style="font-family:'Space Grotesk',sans-serif;">
  <div class="overflow-hidden rounded-2xl relative flex-shrink-0" style="width:55%;">
    <img src="[URL_ANCLA]" class="w-full h-full object-cover" crossorigin="anonymous" />
    <div class="absolute bottom-0 left-0 right-0 p-10" style="background:linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 60%);">
      <h2 class="text-[52px] font-black text-white leading-[0.95]">[TITULO_ANCLA]</h2>
    </div>
  </div>
  <div class="flex-1 flex flex-col gap-3">
    <div class="flex gap-3 flex-1">
      <div class="flex-1 rounded-2xl overflow-hidden">
        <img src="[URL_T1]" class="w-full h-full object-cover" crossorigin="anonymous" />
      </div>
      <div class="flex-1 rounded-2xl overflow-hidden">
        <img src="[URL_T2]" class="w-full h-full object-cover" crossorigin="anonymous" />
      </div>
    </div>
    <div class="flex gap-3 flex-1">
      <div class="flex-1 rounded-2xl overflow-hidden">
        <img src="[URL_T3]" class="w-full h-full object-cover" crossorigin="anonymous" />
      </div>
      <div class="flex-1 bg-primary rounded-2xl flex flex-col justify-between p-8">
        <span class="text-[13px] uppercase tracking-widest text-on-primary" style="opacity:0.65;">[LABEL_STAT]</span>
        <div>
          <p class="text-[72px] font-black text-on-primary leading-none">[NUMERO]</p>
          <p class="text-[18px] text-on-primary mt-2" style="opacity:0.7;">[CONTEXTO]</p>
        </div>
      </div>
    </div>
  </div>
</section>`,
  "P-11": `<section class="w-[1920px] h-[1080px] overflow-hidden relative" style="font-family:'Space Grotesk',sans-serif;">
  <div class="absolute inset-0 p-3" style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; grid-template-rows:1fr 1fr; gap:12px;">
    <div style="grid-column:1; grid-row:1/span 2; border-radius:16px; overflow:hidden;">
      <img src="[URL_TALL1]" class="w-full h-full object-cover" crossorigin="anonymous" />
    </div>
    <div style="grid-column:2; grid-row:1; border-radius:16px; overflow:hidden;">
      <img src="[URL_H1]" class="w-full h-full object-cover" crossorigin="anonymous" />
    </div>
    <div style="grid-column:3; grid-row:1/span 2; border-radius:16px; overflow:hidden;">
      <img src="[URL_TALL2]" class="w-full h-full object-cover" crossorigin="anonymous" />
    </div>
    <div style="grid-column:4; grid-row:1; border-radius:16px; overflow:hidden;">
      <img src="[URL_H2]" class="w-full h-full object-cover" crossorigin="anonymous" />
    </div>
    <div style="grid-column:2; grid-row:2; border-radius:16px; overflow:hidden;">
      <img src="[URL_H3]" class="w-full h-full object-cover" crossorigin="anonymous" />
    </div>
    <div style="grid-column:4; grid-row:2; border-radius:16px; overflow:hidden;">
      <img src="[URL_H4]" class="w-full h-full object-cover" crossorigin="anonymous" />
    </div>
  </div>
  <div class="absolute inset-0 pointer-events-none" style="background:linear-gradient(to left, rgba(0,0,0,0.82) 25%, rgba(0,0,0,0.2) 55%, transparent 100%);"></div>
  <div class="absolute inset-0 pointer-events-none" style="background:linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%);"></div>
  <div class="absolute bottom-[80px] right-[90px] text-right">
    <h2 class="text-[100px] font-black text-white leading-[0.88]" style="letter-spacing:-0.03em;">[LINEA1]<br/>[LINEA2]<br/>[LINEA3].</h2>
    <div class="flex items-center justify-end gap-4 mt-6">
      <div class="w-10 h-[2px] bg-white" style="opacity:0.5;"></div>
      <p class="text-[22px] text-white font-light" style="opacity:0.65;">[TAGLINE]</p>
    </div>
  </div>
</section>`,
  "HEX-01": `<section class="w-[1920px] h-[1080px] overflow-hidden flex items-center bg-primary" style="font-family:'Space Grotesk',sans-serif; background-image: radial-gradient(ellipse 1400px 900px at 10% 50%, rgba(0,0,0,0.28) 0%, transparent 55%), radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px); background-size: 100% 100%, 50px 50px;">
  <div class="flex flex-col gap-8" style="width:56%; padding:90px 80px 90px 100px;">
    <h1 class="text-[64px] font-black leading-[1.04] text-on-primary uppercase" style="letter-spacing:-0.01em;">[HEADLINE]</h1>
    <p class="text-[22px] text-on-primary leading-relaxed font-semibold" style="opacity:0.85;">[CUERPO]</p>
    <p class="text-[17px] text-on-primary" style="opacity:0.50;">[NOTA_AL_PIE]</p>
  </div>
  <div class="flex-1 flex items-center justify-center">
    <div class="relative" style="width:500px; height:578px;">
      <div class="absolute inset-0 bg-primary" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); filter: brightness(1.9) saturate(1.2);"></div>
      <div class="absolute overflow-hidden" style="inset:3%; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);">
        <img src="[URL_PEXELS]" class="w-full h-full object-cover" style="object-position: top center;" crossorigin="anonymous" />
      </div>
    </div>
  </div>
</section>`,
}

// ==================== SYNTHESIS FOR PROMPT ====================

/**
 * Heurística simple: matchea businessType de la org contra las llaves de
 * PATTERNS_BY_BUSINESS_TYPE. No es estricta — el modelo decide al final.
 */
export function suggestPatternsForBusiness(
  businessType: string | null | undefined,
): string[] {
  if (!businessType) return PATTERNS_BY_BUSINESS_TYPE.default
  const normalized = businessType.toLowerCase()
  for (const [key, patterns] of Object.entries(PATTERNS_BY_BUSINESS_TYPE)) {
    if (key !== "default" && normalized.includes(key)) return patterns
  }
  // Hints adicionales por palabras clave
  if (/(salon|spa|estetica|wellness|nutri|coach)/i.test(normalized))
    return ["P-03", "P-02", "P-10", "P-06", "P-11"]
  if (/(restaurante|cafe|bar|hotel)/i.test(normalized))
    return ["P-01", "P-04", "P-10", "P-07", "P-11"]
  if (/(barberia|barber|peluqueria|estilista)/i.test(normalized))
    return ["P-03", "P-05", "P-10", "P-04", "P-11"]
  return PATTERNS_BY_BUSINESS_TYPE.default
}

/**
 * Sintetiza las directivas de diseño en un bloque que se inyecta al prompt
 * de generación. Conserva todo el material crítico del skill (contraste,
 * espacio, tipografía por audiencia, patrones, bugs, imágenes) en formato
 * compacto. Aproximadamente 1100-1300 tokens; vale la pena por la mejora
 * de calidad a la primera y la reducción de trabajo del sanitizer.
 */
export function buildDesignDirectives(
  businessType?: string | null,
): string {
  const suggested = suggestPatternsForBusiness(businessType)
  const patternList = LANDING_PATTERNS.map(
    (p) =>
      `· ${p.id} (${p.tier}) — ${p.name}: ${p.useCase}.\n  ${p.recipe}`,
  ).join("\n")
  const suggestedNames = suggested
    .map((id) => {
      const p = LANDING_PATTERNS.find((x) => x.id === id)
      return p ? `${p.id} (${p.name})` : id
    })
    .join(", ")

  return `=== DIRECTIVAS DE DISEÑO ===

${HARD_RULES}

--- TOKENS SEMÁNTICOS ---
${SEMANTIC_TOKENS}

--- CONTRASTE ---
${CONTRAST_RULES}

--- ESPACIO Y LAYOUT ---
${SPACE_RULES}

--- TIPOGRAFÍA POR AUDIENCIA ---
${TYPO_BY_AUDIENCE}

--- CATÁLOGO DE PATRONES (adapta a sections responsive 375/768/1280) ---
${patternList}

--- PATRONES SUGERIDOS PARA ESTE NEGOCIO ---
${suggestedNames}
(Sugerencia, no obligación. Mezcla y adapta según el contenido. Cada sección debería usar un patrón distinto para mantener ritmo visual.)

--- BUGS A EVITAR ---
${PATTERN_BUGS}

--- IMÁGENES ---
${PEXELS_RULES}

=== FIN DIRECTIVAS ===`
}
