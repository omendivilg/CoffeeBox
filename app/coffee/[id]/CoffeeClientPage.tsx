"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ReviewCard } from "@/components/review-card";
import { Header } from "@/components/header";
import { MapPin, Star, Users } from "lucide-react";
import type { Coffee, Review } from "@/types";

export default function CoffeeClientPage() {
  const params = useParams();
  const { user } = useAuth();
  const [coffee, setCoffee] = useState<Coffee | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [indexError, setIndexError] = useState(false);

  useEffect(() => {
    if (params.id) {
      console.log("Coffee ID changed, fetching data:", params.id);
      fetchCoffeeData();
      fetchReviews();
    }
  }, [params.id]);

  const fetchCoffeeData = async () => {
    try {
      const coffeeDoc = await getDoc(doc(db, "coffees", params.id as string));
      if (coffeeDoc.exists()) {
        setCoffee({ id: coffeeDoc.id, ...coffeeDoc.data() } as Coffee);
      }
    } catch (error) {
      console.error("Error fetching coffee:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      console.log("Fetching reviews for coffee:", params.id);
      const reviewsRef = collection(db, "reviews");

      // Primero intentamos con orderBy
      try {
        const q = query(
          reviewsRef,
          where("coffeeId", "==", params.id as string)
        );
        const snapshot = await getDocs(q);
        console.log(
          `Found ${snapshot.docs.length} reviews for coffee ${params.id}`
        );

        const reviewsData = snapshot.docs.map((doc) => {
          const data = doc.data();

          // Asegurarse de que createdAt sea un objeto Date
          let createdAt;
          if (data.createdAt && typeof data.createdAt.toDate === "function") {
            createdAt = data.createdAt.toDate();
          } else if (data.createdAt instanceof Date) {
            createdAt = data.createdAt;
          } else {
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
        }) as Review[];

        // Ordenar manualmente por fecha
        reviewsData.sort((a, b) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        console.log("Final reviews data:", reviewsData);
        setReviews(reviewsData);

        // Actualizar el contador de reviews en el café si no coincide
        if (coffee && reviewsData.length !== coffee.reviewCount) {
          console.log(
            "Review count mismatch. Actual:",
            reviewsData.length,
            "Stored:",
            coffee.reviewCount
          );
          updateCoffeeStats(reviewsData);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setIndexError(true);
      }
    } catch (error) {
      console.error("Error in fetchReviews:", error);
    }
  };

  // Función para actualizar las estadísticas del café basado en las reviews reales
  const updateCoffeeStats = async (reviewsData: Review[]) => {
    if (!coffee) return;

    try {
      const coffeeRef = doc(db, "coffees", coffee.id);

      // Calcular estadísticas reales
      const totalRating = reviewsData.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const reviewCount = reviewsData.length;
      const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

      console.log("Updating coffee stats with real data:", {
        reviewCount,
        totalRating,
        averageRating,
      });

      // Actualizar en Firestore
      await updateDoc(coffeeRef, {
        reviewCount,
        totalRating,
        averageRating,
      });

      // Actualizar en el estado local
      setCoffee({
        ...coffee,
        reviewCount,
        totalRating,
        averageRating,
      });

      console.log("Coffee stats synchronized successfully");
    } catch (error) {
      console.error("Error updating coffee stats:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !coffee || userRating === 0) {
      alert("Por favor inicia sesión y proporciona una calificación");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting review for coffee:", coffee.id);

      // Crear objeto de reseña
      const reviewData = {
        coffeeId: coffee.id,
        userId: user.uid,
        userName: user.displayName || "Usuario",
        userPhoto: user.photoURL || "",
        rating: userRating,
        text: reviewText,
        createdAt: new Date(),
      };

      console.log("Review data:", reviewData);

      // Añadir reseña
      const docRef = await addDoc(collection(db, "reviews"), reviewData);
      console.log("Review added with ID:", docRef.id);

      // Actualizar estadísticas del café
      const coffeeRef = doc(db, "coffees", coffee.id);
      const newTotalRating = coffee.totalRating + userRating;
      const newReviewCount = coffee.reviewCount + 1;
      const newAverageRating = newTotalRating / newReviewCount;

      await updateDoc(coffeeRef, {
        reviewCount: newReviewCount,
        totalRating: newTotalRating,
        averageRating: newAverageRating,
      });

      console.log("Coffee stats updated");

      // Añadir la nueva reseña al estado local para actualización inmediata
      const newReview = {
        id: docRef.id,
        ...reviewData,
      };

      setReviews((prevReviews) => [newReview, ...prevReviews]);

      // Actualizar el café en el estado local
      setCoffee({
        ...coffee,
        reviewCount: newReviewCount,
        totalRating: newTotalRating,
        averageRating: newAverageRating,
      });

      // Resetear formulario
      setReviewText("");
      setUserRating(0);

      alert("¡Reseña añadida con éxito!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error al enviar la reseña. Por favor intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <LoadingSpinner />
      </div>
    );
  }

  if (!coffee) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p>Coffee shop not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Coffee Header */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
              <Image
                src={coffee.imageUrl || "/placeholder.svg?height=400&width=600"}
                alt={coffee.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold">{coffee.name}</h1>

              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{coffee.location}</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-semibold text-lg">
                    {coffee.averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{reviews.length} reviews</span>
                </div>
              </div>

              {coffee.description && (
                <p className="text-muted-foreground">{coffee.description}</p>
              )}

              {coffee.tags && coffee.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {coffee.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mensaje de índice si es necesario */}
          {indexError && (
            <Card className="mb-8 bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 text-yellow-800">
                <h3 className="font-semibold mb-2">
                  ⚠️ Acción requerida: Crear índice en Firestore
                </h3>
                <p className="mb-2">
                  Para que la aplicación funcione correctamente, necesitas crear
                  un índice en Firestore:
                </p>
                <ol className="list-decimal pl-5 mb-2">
                  <li>
                    Haz clic en este enlace:{" "}
                    <a
                      href="https://console.firebase.google.com/v1/r/project/coffeeco-3280e/firestore/indexes?create_composite=Ck5wcm9qZWN0cy9jb2ZmZWVjby0zMjgwZS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvcmV2aWV3cy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Crear índice en Firebase
                    </a>
                  </li>
                  <li>
                    Inicia sesión en tu cuenta de Firebase si es necesario
                  </li>
                  <li>Haz clic en "Crear índice" en la página que se abre</li>
                  <li>
                    Espera unos minutos a que el índice termine de crearse
                  </li>
                </ol>
                <p>
                  Una vez creado el índice, la aplicación funcionará sin
                  errores.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Review Form */}
          {user && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Rating
                  </label>
                  <StarRating
                    rating={userRating}
                    onRatingChange={setUserRating}
                    size="lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Review
                  </label>
                  <Textarea
                    placeholder="Share your experience at this coffee shop..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting || userRating === 0}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              Reviews ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    No reviews yet. Be the first to review this coffee shop!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
