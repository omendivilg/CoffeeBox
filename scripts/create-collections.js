import { initializeApp } from "firebase/app"
import { getFirestore, collection, doc, setDoc } from "firebase/firestore"

// Initialize Firebase (using environment variables)
const firebaseConfig = {
  apiKey: "AIzaSyCuGsTmTZ493Xf8b6i196gllWA_yShAGMY",
  authDomain: "coffeeco-3280e.firebaseapp.com",
  projectId: "coffeeco-3280e",
  storageBucket: "coffeeco-3280e.firebasestorage.app",
  messagingSenderId: "476649270345",
  appId: "1:476649270345:web:2e3e9002dbaf55e68b2398",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function createCollections() {
  try {
    console.log("🔥 Initializing Firestore collections...")

    // Create a dummy document in each collection to initialize them
    // Firestore collections are created automatically when you add the first document

    // Initialize coffees collection
    const coffeeRef = doc(collection(db, "coffees"), "init")
    await setDoc(coffeeRef, {
      name: "Initialization Document",
      location: "System",
      description: "This document initializes the collection",
      averageRating: 0,
      reviewCount: 0,
      totalRating: 0,
      tags: ["system"],
      createdAt: new Date(),
      _isInit: true,
    })

    // Initialize reviews collection
    const reviewRef = doc(collection(db, "reviews"), "init")
    await setDoc(reviewRef, {
      coffeeId: "init",
      userId: "system",
      userName: "System",
      rating: 5,
      text: "This document initializes the collection",
      createdAt: new Date(),
      _isInit: true,
    })

    // Initialize users collection
    const userRef = doc(collection(db, "users"), "init")
    await setDoc(userRef, {
      email: "system@coffeebox.app",
      displayName: "System User",
      createdAt: new Date(),
      _isInit: true,
    })

    console.log("✅ Collections initialized successfully!")
    console.log("📊 Created collections: coffees, reviews, users")
  } catch (error) {
    console.error("❌ Error initializing collections:", error)
  }
}

// Run the initialization
createCollections()
