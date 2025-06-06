"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { CoffeeCard } from "@/components/coffee-card";
import { SearchBar } from "@/components/search-bar";
import { Header } from "@/components/header";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Coffee } from "@/types";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCoffees();
  }, []);

  const fetchCoffees = async () => {
    try {
      console.log("Fetching coffees...");
      const coffeesRef = collection(db, "coffees");
      const q = query(coffeesRef, orderBy("averageRating", "desc"), limit(20));
      const snapshot = await getDocs(q);

      const coffeesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Coffee[];

      console.log("Fetched coffees:", coffeesData);

      // Actualizar el contador real de reviews para cada café
      const coffeesWithRealCounts = await Promise.all(
        coffeesData.map(async (coffee) => {
          try {
            // Obtener el número real de reviews para este café
            const reviewsRef = collection(db, "reviews");
            const reviewsQuery = query(
              reviewsRef,
              where("coffeeId", "==", coffee.id)
            );
            const reviewsSnapshot = await getDocs(reviewsQuery);
            const realReviewCount = reviewsSnapshot.docs.length;

            // Calcular el rating promedio real
            let realAverageRating = 0;
            let realTotalRating = 0;

            if (realReviewCount > 0) {
              realTotalRating = reviewsSnapshot.docs.reduce((sum, doc) => {
                const reviewData = doc.data();
                return sum + (reviewData.rating || 0);
              }, 0);
              realAverageRating = realTotalRating / realReviewCount;
            }

            console.log(
              `Coffee ${coffee.name}: stored=${coffee.reviewCount}, real=${realReviewCount}`
            );

            // Si hay discrepancia, actualizar en Firestore
            if (
              realReviewCount !== coffee.reviewCount ||
              Math.abs(realAverageRating - coffee.averageRating) > 0.1
            ) {
              console.log(`Updating stats for ${coffee.name}`);
              const coffeeRef = doc(db, "coffees", coffee.id);
              await updateDoc(coffeeRef, {
                reviewCount: realReviewCount,
                totalRating: realTotalRating,
                averageRating: realAverageRating,
              });
            }

            return {
              ...coffee,
              reviewCount: realReviewCount,
              totalRating: realTotalRating,
              averageRating: realAverageRating,
            };
          } catch (error) {
            console.error(`Error updating coffee ${coffee.id}:`, error);
            return coffee;
          }
        })
      );

      setCoffees(coffeesWithRealCounts);
    } catch (error) {
      console.error("Error fetching coffees:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoffees = coffees.filter(
    (coffee) =>
      coffee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coffee.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coffee.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Discover Amazing Coffee
            </h1>
            <p className="text-muted-foreground text-lg">
              Rate, review, and discover the best coffee shops around you
            </p>

            {/* Mensaje para usuarios no logueados */}
            {!authLoading && !user && (
              <Card className="mt-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-blue-800 mb-3">
                    ¡Bienvenido a Coffeebox! Puedes explorar cafés sin
                    registrarte, pero necesitas una cuenta para dejar reseñas.
                  </p>
                  <div className="flex justify-center space-x-3">
                    <Button asChild size="sm">
                      <Link href="/register">Crear cuenta</Link>
                    </Button>
                    <Button variant="outline" asChild size="sm">
                      <Link href="/login">Iniciar sesión</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search coffee shops, locations, or tags..."
          />

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-6">
              {searchQuery
                ? `Search Results (${filteredCoffees.length})`
                : "Popular Coffee Shops"}
            </h2>

            {filteredCoffees.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No coffee shops found matching your search."
                    : "No coffee shops available."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoffees.map((coffee) => (
                  <CoffeeCard key={coffee.id} coffee={coffee} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
