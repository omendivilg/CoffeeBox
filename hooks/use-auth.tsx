"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import {
  type User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.uid);

      if (user) {
        // Crear o actualizar el documento del usuario en Firestore
        await createUserDocument(user);
      }

      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createUserDocument = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Solo crear el documento si no existe
      if (!userSnap.exists()) {
        console.log("Creating new user document for:", user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log("User document created successfully");
      } else {
        // Actualizar la información si el usuario ya existe
        console.log("Updating existing user document for:", user.uid);
        await setDoc(
          userRef,
          {
            email: user.email,
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            updatedAt: new Date(),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("Error creating/updating user document:", error);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
