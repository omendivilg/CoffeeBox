"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/star-rating";
import type { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (date: any) => {
    if (!date) return "";

    try {
      // Si es un timestamp de Firestore
      if (typeof date.toDate === "function") {
        return date.toDate().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      // Si ya es un objeto Date
      if (date instanceof Date) {
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      // Si es un string o timestamp
      return new Date(date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Fecha desconocida";
    }
  };

  console.log("Review data:", review);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage
              src={review.userPhoto || "/placeholder.svg"}
              alt={review.userName}
            />
            <AvatarFallback>
              {review.userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{review.userName}</h4>
              <span className="text-sm text-muted-foreground">
                {review.createdAt
                  ? formatDate(review.createdAt)
                  : "Fecha reciente"}
              </span>
            </div>

            <StarRating rating={review.rating} readonly size="sm" />

            {review.text && (
              <p className="text-muted-foreground mt-2">{review.text}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
