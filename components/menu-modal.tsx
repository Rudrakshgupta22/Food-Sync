"use client"

import { useState } from "react"
import Image from "next/image"
import { X, Star, Clock, Plus, Minus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Restaurant, MenuItem } from "@/lib/data"

interface MenuModalProps {
  restaurant: Restaurant
  onClose: () => void
}

interface CartItem extends MenuItem {
  quantity: number
}

export function MenuModal({ restaurant, onClose }: MenuModalProps) {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId)
      if (existing && existing.quantity > 1) {
        return prev.map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
      }
      return prev.filter((i) => i.id !== itemId)
    })
  }

  const getItemQuantity = (itemId: string) => {
    return cart.find((i) => i.id === itemId)?.quantity || 0
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-t-3xl sm:rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        {/* Header Image */}
        <div className="relative h-48">
          <Image src={restaurant.image || "/placeholder.svg"} alt={restaurant.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white">{restaurant.name}</h2>
            <p className="text-white/80 text-sm">{restaurant.cuisine.join(" • ")}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded text-sm font-medium">
                <Star className="w-3 h-3 fill-current" />
                {restaurant.rating}
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <Clock className="w-4 h-4" />
                {restaurant.deliveryTime}
              </div>
              <span className="text-white/80 text-sm">{restaurant.priceRange}</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-12rem-4rem)]">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Menu</h3>
          <div className="space-y-4">
            {restaurant.menuItems.map((item) => {
              const quantity = getItemQuantity(item.id)
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-4 h-4 border-2 rounded flex items-center justify-center",
                              item.isVeg ? "border-green-500" : "border-red-500",
                            )}
                          >
                            <div className={cn("w-2 h-2 rounded-full", item.isVeg ? "bg-green-500" : "bg-red-500")} />
                          </div>
                          <h4 className="font-medium text-foreground">{item.name}</h4>
                          {item.isBestseller && (
                            <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">
                              Bestseller
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                        <p className="text-sm font-semibold mt-1 text-foreground">₹{item.price}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {quantity === 0 ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                            onClick={() => addToCart(item)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 bg-primary rounded-lg">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-semibold text-primary-foreground w-4 text-center">
                              {quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
                              onClick={() => addToCart(item)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cart Footer */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-border bg-card">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base">
              <ShoppingBag className="w-5 h-5 mr-2" />
              {totalItems} item{totalItems > 1 ? "s" : ""} • ₹{totalPrice}
              <span className="ml-auto">View Cart →</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
