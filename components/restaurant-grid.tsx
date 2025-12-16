"use client"

import { useState } from "react"
import { RestaurantCard } from "@/components/restaurant-card"
import { MenuModal } from "@/components/menu-modal"
import type { Restaurant } from "@/lib/data"

interface RestaurantGridProps {
  restaurants: Restaurant[]
}

export function RestaurantGrid({ restaurants }: RestaurantGridProps) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🍽️</span>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No restaurants found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or search in a different city</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onClick={() => setSelectedRestaurant(restaurant)}
          />
        ))}
      </div>

      {selectedRestaurant && <MenuModal restaurant={selectedRestaurant} onClose={() => setSelectedRestaurant(null)} />}
    </>
  )
}
