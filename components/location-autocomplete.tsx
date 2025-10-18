"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

declare global {
  interface Window {
    google: any
    __googleMapsScriptLoading?: Promise<void>
  }
}

interface LocationAutocompleteProps {
  id: string
  name: string
  label: string
  required?: boolean
  placeholder?: string
  addressType?: "cities" | "address"
  onPlaceSelected?: (place: any) => void
  onTimezoneDetected?: (timezone: string) => void
}

// Global function to load Google Maps script only once
function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve()
  }

  // If already loaded, return resolved promise
  if (window.google) {
    return Promise.resolve()
  }

  // If already loading, return the existing promise
  if (window.__googleMapsScriptLoading) {
    return window.__googleMapsScriptLoading
  }

  // Create new loading promise
  window.__googleMapsScriptLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      window.__googleMapsScriptLoading = undefined
      reject(new Error("Failed to load Google Maps"))
    }
    document.head.appendChild(script)
  })

  return window.__googleMapsScriptLoading
}

export function LocationAutocomplete({
  id,
  name,
  label,
  required = false,
  placeholder = "Start typing a city...",
  addressType = "cities",
  onPlaceSelected,
  onTimezoneDetected,
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load Google Maps script using the singleton function
    loadGoogleMapsScript()
      .then(() => setIsLoaded(true))
      .catch((err) => {
        console.error("Failed to load Google Maps:", err)
        setError("Failed to load Google Maps")
      })
  }, [])

  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google) return

    try {
      const autocompleteOptions: any = {
        fields: ["formatted_address", "geometry", "name", "address_components"],
      }

      if (addressType === "cities") {
        autocompleteOptions.types = ["(cities)"]
      }

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, autocompleteOptions)

      autocomplete.addListener("place_changed", async () => {
        const place = autocomplete.getPlace()

        if (place.geometry?.location) {
          onPlaceSelected?.(place)

          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const timestamp = Math.floor(Date.now() / 1000) // Current timestamp in seconds

          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
            )
            const data = await response.json()

            if (data.status === "OK" && data.timeZoneId) {
              onTimezoneDetected?.(data.timeZoneId)
            } else {
              console.error("[v0] Google Timezone API error:", data.status)
              // Fallback to browser timezone
              onTimezoneDetected?.(Intl.DateTimeFormat().resolvedOptions().timeZone)
            }
          } catch (err) {
            console.error("[v0] Timezone detection failed:", err)
            // Fallback to browser timezone
            onTimezoneDetected?.(Intl.DateTimeFormat().resolvedOptions().timeZone)
          }
        }
      })
    } catch (err) {
      console.error("[v0] Autocomplete initialization failed:", err)
      setError("Failed to initialize autocomplete")
    }
  }, [isLoaded, addressType, onPlaceSelected, onTimezoneDetected])

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && "*"}
      </Label>
      <Input ref={inputRef} id={id} name={name} type="text" required={required} placeholder={placeholder} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
