"use client"

import { cn } from "@/lib/utils"
import { cuisineTypes } from "@/lib/data"

interface CuisineFilterProps {
  selectedCuisine: string
  onCuisineChange: (cuisine: string) => void
}

export function CuisineFilter({ selectedCuisine, onCuisineChange }: CuisineFilterProps) {
  return (
    <div className="py-4 overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 min-w-max px-4 sm:px-0">
        {cuisineTypes.map((cuisine) => (
          <button
            key={cuisine}
            onClick={() => onCuisineChange(cuisine)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              "hover:scale-105 active:scale-95",
              selectedCuisine === cuisine
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            {cuisine}
          </button>
        ))}
      </div>
    </div>
  )
}
