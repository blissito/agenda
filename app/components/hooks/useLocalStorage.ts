import { useCallback, useEffect, useState } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  // SSR safe: siempre inicia con initialValue
  const [value, setValue] = useState<T>(initialValue)

  // Hidratar desde localStorage después del mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) setValue(JSON.parse(stored))
    } catch {
      // localStorage no disponible (modo privado)
    }
  }, [key])

  // Setter que persiste
  const set = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof newValue === "function"
            ? (newValue as (prev: T) => T)(prev)
            : newValue
        try {
          localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          // Silenciar errores de storage
        }
        return resolved
      })
    },
    [key],
  )

  return [value, set] as const
}
