"use client"

import { useState } from "react"
import { MapPin, Search, ChevronDown, Menu, X, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cities } from "@/lib/data"

interface NavbarProps {
  selectedCity: string
  onCityChange: (city: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function Navbar({ selectedCity, onCityChange, searchQuery, onSearchChange }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Utensils className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">Smart Food Finder</span>
          </div>

          {/* City Selector & Search - Desktop */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[140px] bg-transparent">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{selectedCity}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                {cities.map((city) => (
                  <DropdownMenuItem
                    key={city}
                    onClick={() => onCityChange(city)}
                    className={selectedCity === city ? "bg-primary/10 text-primary" : ""}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {city}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for restaurants or cuisines..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-secondary border-none"
              />
            </div>
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Offers
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign In</Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-in slide-in-from-top-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full gap-2 justify-between bg-transparent">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{selectedCity}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[calc(100vw-2rem)]">
                {cities.map((city) => (
                  <DropdownMenuItem
                    key={city}
                    onClick={() => {
                      onCityChange(city)
                      setMobileMenuOpen(false)
                    }}
                    className={selectedCity === city ? "bg-primary/10 text-primary" : ""}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {city}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-secondary border-none"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent">
                Offers
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground">Sign In</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
