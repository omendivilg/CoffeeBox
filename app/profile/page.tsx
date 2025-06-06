"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Header } from "@/components/header";
import { Coffee, Star, MessageSquare } from "lucide-react";
import Link from "next/link";
import type { Review, Coffee as CoffeeType } from "@/types";

interface ReviewWithCoffee extends Review {
  coffeeName?: string;
  coffeeLocation?: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithCoffee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserReviews();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchUserReviews = async () => {
    if (!user) return;

    try {
      console.log("Fetching reviews for user:", user.uid);
      setError(null);

      // Método 1: Intentar con la consulta simple (sin orderBy)
      const reviewsRef = collection(db, "reviews");
      const q = query(reviewsRef, where("userId", "==", user.uid));

      console.log("Executing query for userId:", user.uid);
      const snapshot = await getDocs(q);
      console.log(`Found ${snapshot.docs.length} reviews for user ${user.uid}`);

      if (snapshot.empty) {
        console.log("No reviews found for this user");
        setReviews([]);
        setLoading(false);
        return;
      }

      // Obtener los datos de las reseñas
      const reviewsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Review data:", data);

        let createdAt;
        try {
          if (data.createdAt && typeof data.createdAt.toDate === "function") {
            createdAt = data.createdAt.toDate();
          } else if (data.createdAt instanceof Date) {
            createdAt = data.createdAt;
          } else if (data.createdAt) {
            createdAt = new Date(data.createdAt);
          } else {
            createdAt = new Date();
          }
        } catch (dateError) {
          console.error("Error parsing date:", dateError);
          createdAt = new Date();
        }

        return {
          id: doc.id,
          coffeeId: data.coffeeId,
          userId: data.userId,
          userName: data.userName,
          userPhoto: data.userPhoto || "",
          rating: data.rating,
          text: data.text || "",
          createdAt,
        };
      }) as ReviewWithCoffee[];

      // Ordenar manualmente por fecha (más reciente primero)
      reviewsData.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      console.log("Sorted reviews data:", reviewsData);

      // Obtener información adicional de los cafés para cada reseña
      const reviewsWithCoffeeData = await Promise.all(
        reviewsData.map(async (review) => {
          try {
            console.log("Fetching coffee data for coffeeId:", review.coffeeId);
            const coffeeDoc = await getDoc(doc(db, "coffees", review.coffeeId));
            if (coffeeDoc.exists()) {
              const coffeeData = coffeeDoc.data() as CoffeeType;
              return {
                ...review,
                coffeeName: coffeeData.name,
                coffeeLocation: coffeeData.location,
              };
            } else {
              console.log("Coffee not found for ID:", review.coffeeId);
              return {
                ...review,
                coffeeName: "Coffee Shop (Not Found)",
                coffeeLocation: "Unknown Location",
              };
            }
          } catch (error) {
            console.error(
              `Error fetching coffee data for review ${review.id}:`,
              error
            );
            return {
              ...review,
              coffeeName: "Coffee Shop",
              coffeeLocation: "Unknown Location",
            };
          }
        })
      );

      console.log("Final reviews with coffee data:", reviewsWithCoffeeData);
      setReviews(reviewsWithCoffeeData);
    } catch (error: any) {
      console.error("Error fetching user reviews:", error);

      if (
        error.code === "failed-precondition" ||
        error.message.includes("index")
      ) {
        setError(
          "Índice de Firestore requerido. Por favor, espera unos minutos para que se propague o verifica que se haya creado correctamente."
        );
      } else {
        setError("Error al cargar las reseñas. Por favor, intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <p className="mb-4">Por favor inicia sesión para ver tu perfil</p>
              <Link href="/login" className="text-primary hover:underline">
                Iniciar sesión
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={user.photoURL || ""}
                    alt={user.displayName || ""}
                  />
                  <AvatarFallback className="text-2xl">
                    {user.displayName?.charAt(0) ||
                      user.email?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">
                    {user.displayName || "Coffee Lover"}
                  </h1>
                  <p className="text-muted-foreground mb-4">{user.email}</p>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>{reviews.length}</strong> reviews
                      </span>
                    </div>

                    {reviews.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm">
                          <strong>{averageRating.toFixed(1)}</strong> average
                          rating
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error message */}
          {error && (
            <Card className="mb-8 bg-red-50 border-red-200">
              <CardContent className="p-4 text-red-800">
                <h3 className="font-semibold mb-2">❌ Error</h3>
                <p>{error}</p>
                <button
                  onClick={fetchUserReviews}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reintentar
                </button>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Coffee className="h-5 w-5" />
                <span>Your Reviews ({reviews.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 && !error ? (
                <div className="text-center py-8">
                  <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    You haven't reviewed any coffee shops yet.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start exploring and share your coffee experiences!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Link
                          href={`/coffee/${review.coffeeId}`}
                          className="hover:underline"
                        >
                          <h3 className="font-semibold">
                            {review.coffeeName || "Coffee Shop"}
                          </h3>
                          {review.coffeeLocation && (
                            <p className="text-sm text-muted-foreground">
                              {review.coffeeLocation}
                            </p>
                          )}
                        </Link>
                        <Badge variant="outline">
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString()
                            : "Fecha reciente"}
                        </Badge>
                      </div>

                      <StarRating rating={review.rating} readonly size="sm" />

                      {review.text && (
                        <p className="text-muted-foreground mt-2">
                          {review.text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
