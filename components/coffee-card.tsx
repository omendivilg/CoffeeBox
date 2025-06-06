"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star } from "lucide-react"
import type { Coffee } from "@/types"

interface CoffeeCardProps {
  coffee: Coffee
}

export function CoffeeCard({ coffee }: CoffeeCardProps) {
  return (
    <Link href={`/coffee/${coffee.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-[4/3] relative">
          <Image
            src={coffee.imageUrl || "/placeholder.svg?height=300&width=400"}
            alt={coffee.name}
            fill
            className="object-cover"
          />
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{coffee.name}</h3>

          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{coffee.location}</span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-medium">{coffee.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground ml-1">({coffee.reviewCount} reviews)</span>
            </div>
          </div>

          {coffee.tags && coffee.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {coffee.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {coffee.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{coffee.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
