"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { CuisineFilter } from "@/components/cuisine-filter"
import { RestaurantGrid } from "@/components/restaurant-grid"
import { Chatbot } from "@/components/chatbot"
import { restaurants } from "@/lib/data"

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState("Mumbai")
  const [selectedCuisine, setSelectedCuisine] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      // Filter by city
      if (restaurant.city !== selectedCity) return false

      // Filter by cuisine
      if (selectedCuisine !== "All" && !restaurant.cuisine.includes(selectedCuisine)) {
        return false
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = restaurant.name.toLowerCase().includes(query)
        const matchesCuisine = restaurant.cuisine.some((c) => c.toLowerCase().includes(query))
        const matchesMenu = restaurant.menuItems.some((item) => item.name.toLowerCase().includes(query))
        if (!matchesName && !matchesCuisine && !matchesMenu) return false
      }

      return true
    })
  }, [selectedCity, selectedCuisine, searchQuery])

  const featuredRestaurants = filteredRestaurants.filter((r) => r.featured)
  const regularRestaurants = filteredRestaurants.filter((r) => !r.featured)

  return (
    <main className="min-h-screen bg-background">
      <Navbar
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <HeroSection selectedCity={selectedCity} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <CuisineFilter selectedCuisine={selectedCuisine} onCuisineChange={setSelectedCuisine} />

        {/* Featured Restaurants */}
        {featuredRestaurants.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Featured in {selectedCity}</h2>
            <RestaurantGrid restaurants={featuredRestaurants} />
          </section>
        )}

        {/* All Restaurants */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {selectedCuisine === "All" ? `All Restaurants in ${selectedCity}` : `${selectedCuisine} in ${selectedCity}`}
          </h2>
          <RestaurantGrid restaurants={regularRestaurants} />
        </section>
      </div>

      <Chatbot />
    </main>
  )
}
