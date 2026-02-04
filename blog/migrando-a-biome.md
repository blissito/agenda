# Adiós ESLint y Prettier: Por qué migramos a Biome

*Y por qué tu proyecto indie también debería considerarlo*

---

## La historia de fondo

Si llevas tiempo en el mundo del desarrollo web, probablemente tu proyecto tiene un archivo `.eslintrc.js` con 200 líneas de configuración, otro `.prettierrc`, y un par de plugins que ya no recuerdas por qué instalaste.

Eso era nuestro caso en [Denik Agenda](https://denik.me) — un sistema de agendamiento que llevamos desarrollando varios meses. Llegó un punto donde:

- ESLint tardaba más en correr que nuestros tests
- Teníamos conflictos entre ESLint y Prettier que nunca terminaban
- Cada PR traía el típico "fix lint" commit
- TypeScript ya detectaba el 80% de lo que ESLint reportaba

Así que decidimos investigar alternativas. Encontramos Biome.

---

## ¿Qué es Biome?

[Biome](https://biomejs.dev/) es una herramienta todo-en-uno que reemplaza ESLint, Prettier, y hasta el import sorting. Está escrita en Rust, lo que la hace absurdamente rápida.

| Característica | ESLint + Prettier | Biome |
|----------------|-------------------|-------|
| Velocidad | ~5-10 segundos | ~50-100ms |
| Configuración | 2+ archivos, múltiples plugins | 1 archivo JSON |
| Dependencias | ~50+ paquetes | 1 paquete |
| Formato + Lint | Separados (conflictos frecuentes) | Integrados |

Sí, leíste bien. **10-100x más rápido**.

---

## La migración (spoiler: fue fácil)

### Paso 1: Instalación

```bash
npm install --save-dev @biomejs/biome
npx biome init
```

Eso es todo. Biome crea un `biome.json` con configuración sensata por defecto.

### Paso 2: Configuración

Aquí está nuestra configuración final:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.14/schema.json",
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedImports": "warn",
        "noUnusedVariables": "warn"
      },
      "suspicious": {
        "noExplicitAny": "off"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "asNeeded"
    }
  }
}
```

Notas importantes:

- **`noExplicitAny: off`** — TypeScript strict ya se encarga de esto
- **`noUnusedImports: warn`** — Queremos saberlo, pero no bloquear el CI
- **`a11y: recommended: false`** — Desactivamos las reglas de accesibilidad por ahora (son muy estrictas para un MVP)

### Paso 3: Scripts en package.json

```json
{
  "scripts": {
    "lint": "biome lint .",
    "lint:fix": "biome lint --write --unsafe .",
    "format": "biome format --write .",
    "check": "biome check --write ."
  }
}
```

### Paso 4: Integración con CI

Agregamos una línea a nuestro workflow de GitHub Actions:

```yaml
- run: npm run lint
```

Entre `npm ci` y `npm run typecheck`. Simple.

---

## Resultados reales

Después de la migración:

| Métrica | Antes | Después |
|---------|-------|---------|
| Tiempo de lint | ~8 segundos | ~70ms |
| Archivos de config | 4 | 1 |
| Dependencias de dev | 67 | 58 |
| Conflictos lint/format | Frecuentes | Cero |

---

## ¿Qué perdimos?

Siendo honestos:

1. **Algunas reglas específicas de ESLint** — Biome no tiene el 100% de las reglas de ESLint. Pero tiene las importantes.

2. **Plugins de comunidad** — No hay `eslint-plugin-tailwind` o similares. Aunque honestamente, rara vez los necesitas.

3. **Familiaridad** — Si tu equipo tiene años usando ESLint, hay una curva de aprendizaje (mínima).

---

## ¿Deberías migrar?

**Sí, si:**

- Eres indie/startup y valoras la simplicidad
- Tu CI tarda más de 2 segundos en lint
- Estás cansado de configurar ESLint cada proyecto nuevo
- Usas TypeScript estricto (que ya cubre mucho)

**Quizás no, si:**

- Tienes reglas de ESLint muy específicas de tu empresa
- Dependes de plugins muy especializados
- Tu equipo grande ya tiene todo configurado y funcionando

---

## Conclusión

Biome no es perfecto, pero para proyectos indie es exactamente lo que necesitamos: **rápido, simple, y que funciona**.

La configuración que antes me tomaba una hora ahora toma 5 minutos. El CI que tardaba 10 segundos ahora tarda milisegundos. Y lo más importante: dejé de pelear con herramientas y volví a escribir código.

Si estás empezando un proyecto nuevo o considerando limpiar tu setup de linting, dale una oportunidad a Biome. Probablemente no vuelvas atrás.

---

*¿Tienes preguntas sobre la migración? Encuentra el código completo en nuestro [repositorio](https://github.com/blissito/agenda).*

**— El equipo de Denik**
