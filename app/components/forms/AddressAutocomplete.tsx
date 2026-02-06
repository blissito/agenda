import { useEffect, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

interface PhotonFeature {
  properties: {
    name?: string
    street?: string
    housenumber?: string
    city?: string
    state?: string
    country?: string
    postcode?: string
  }
  geometry: {
    coordinates: [number, number] // [lng, lat]
  }
}

interface AddressResult {
  address: string
  lat: number
  lng: number
}

interface Props {
  name?: string
  label?: string
  placeholder?: string
  defaultValue?: string
  defaultLat?: number | null
  defaultLng?: number | null
  onSelect?: (result: AddressResult) => void
  className?: string
  containerClassName?: string
}

function formatAddress(props: PhotonFeature["properties"]): string {
  const parts: string[] = []

  if (props.street) {
    let streetPart = props.street
    if (props.housenumber) {
      streetPart += ` ${props.housenumber}`
    }
    parts.push(streetPart)
  } else if (props.name) {
    parts.push(props.name)
  }

  if (props.city) parts.push(props.city)
  if (props.state) parts.push(props.state)
  if (props.country) parts.push(props.country)

  return parts.join(", ")
}

export function AddressAutocomplete({
  name = "address",
  label,
  placeholder = "Buscar dirección...",
  defaultValue = "",
  defaultLat,
  defaultLng,
  onSelect,
  className,
  containerClassName,
}: Props) {
  const [query, setQuery] = useState(defaultValue)
  const [results, setResults] = useState<PhotonFeature[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLat, setSelectedLat] = useState<number | null>(
    defaultLat ?? null
  )
  const [selectedLng, setSelectedLng] = useState<number | null>(
    defaultLng ?? null
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const searchAddress = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`
      )
      const data = await response.json()
      setResults(data.features || [])
      setIsOpen(true)
    } catch (error) {
      console.error("Error fetching addresses:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
    // Clear coordinates when user types (they'll be set again on selection)
    setSelectedLat(null)
    setSelectedLng(null)

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      searchAddress(value)
    }, 300)
  }

  const handleSelect = (feature: PhotonFeature) => {
    const address = formatAddress(feature.properties)
    const [lng, lat] = feature.geometry.coordinates

    setQuery(address)
    setSelectedLat(lat)
    setSelectedLng(lng)
    setIsOpen(false)
    setResults([])

    onSelect?.({ address, lat, lng })
  }

  return (
    <div
      ref={containerRef}
      className={twMerge("grid w-full relative", containerClassName)}
    >
      {label && (
        <label
          className={twMerge("text-brand_gray font-satoMedium", className)}
          htmlFor={name}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          name={name}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={twMerge(
            "placeholder:text-brand_iron text-brand_dark font-satoMedium",
            "focus:border-brand_blue",
            "rounded-xl border-gray-200 h-12 w-full mt-1",
            "disabled:bg-brand_stroke disabled:cursor-not-allowed"
          )}
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5">
            <div className="w-4 h-4 border-2 border-brand_blue border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Hidden inputs for lat/lng */}
      <input type="hidden" name="lat" value={selectedLat ?? ""} />
      <input type="hidden" name="lng" value={selectedLng ?? ""} />

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-auto">
          {results.map((feature, index) => {
            const address = formatAddress(feature.properties)
            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleSelect(feature)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm text-brand_dark first:rounded-t-xl last:rounded-b-xl"
                >
                  {address}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
