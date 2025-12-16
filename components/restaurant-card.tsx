"use client"

import Image from "next/image"
import { Star, Clock, Bookmark } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Restaurant } from "@/lib/data"

interface RestaurantCardProps {
  restaurant: Restaurant
  onClick: () => void
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1 border-border/50",
        "bg-card",
      )}
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={restaurant.image || "/placeholder.svg"}
          alt={restaurant.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {restaurant.featured && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Featured</Badge>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <Bookmark className="w-4 h-4" />
        </Button>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-semibold text-white truncate">{restaurant.name}</h3>
          <p className="text-sm text-white/80 truncate">{restaurant.cuisine.join(", ")}</p>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded text-sm font-medium">
                <Star className="w-3 h-3 fill-current" />
                {restaurant.rating}
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              {restaurant.deliveryTime}
            </div>
          </div>
          <span className="text-sm text-muted-foreground">{restaurant.priceRange}</span>
        </div>
      </CardContent>
    </Card>
  )
}
