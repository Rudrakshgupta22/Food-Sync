"use client"

import { Search, MapPin } from "lucide-react"

interface HeroSectionProps {
  selectedCity: string
}

export function HeroSection({ selectedCity }: HeroSectionProps) {
  return (
    <section className="relative py-12 sm:py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
          <MapPin className="w-4 h-4" />
          Delivering in {selectedCity}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
          Discover Your Next
          <span className="text-primary block sm:inline"> Favorite Meal</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
          Explore the best restaurants and cuisines in your city. From local favorites to trending spots, find exactly
          what you&apos;re craving.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Search className="w-5 h-5 text-green-500" />
            </div>
            <span>500+ Restaurants</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">🍽️</span>
            </div>
            <span>50+ Cuisines</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
            <span>Fast Delivery</span>
          </div>
        </div>
      </div>
    </section>
  )
}
