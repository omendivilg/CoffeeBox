import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc, deleteDoc } from "firebase/firestore"

// Initialize Firebase
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

// Sample coffee shop data
const coffeeShops = [
  {
    id: "blue-bottle-sf",
    name: "Blue Bottle Coffee",
    location: "San Francisco, CA",
    description:
      "Artisanal coffee roasted to perfection with a focus on quality and sustainability. Known for their meticulous brewing methods and single-origin beans.",
    imageUrl: "/placeholder.svg?height=400&width=600",
    averageRating: 4.5,
    reviewCount: 127,
    totalRating: 571.5,
    tags: ["artisanal", "sustainable", "single-origin", "specialty"],
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "stumptown-portland",
    name: "Stumptown Coffee Roasters",
    location: "Portland, OR",
    description:
      "Pioneer of the third wave coffee movement with exceptional roasting techniques. A Portland institution serving exceptional coffee since 1999.",
    imageUrl: "/placeholder.svg?height=400&width=600",
    averageRating: 4.3,
    reviewCount: 89,
    totalRating: 382.7,
    tags: ["third-wave", "roastery", "specialty", "local"],
    createdAt: new Date("2024-01-02"),
  },
  {
    id: "intelligentsia-chicago",
    name: "Intelligentsia Coffee",
    location: "Chicago, IL",
    description:
      "Direct trade coffee with a commitment to quality and farmer relationships. Every cup tells a story of craftsmanship and care.",
    imageUrl: "/placeholder.svg?height=400&width=600",
    averageRating: 4.6,
    reviewCount: 203,
    totalRating: 933.8,
    tags: ["direct-trade", "quality", "specialty", "ethical"],
    createdAt: new Date("2024-01-03"),
  },
  {
    id: "counter-culture-durham",
    name: "Counter Culture Coffee",
    location: "Durham, NC",
    description:
      "Sustainable coffee roasting with a focus on education and community. They offer training and cupping sessions for coffee enthusiasts.",
    imageUrl: "/placeholder.svg?height=400&width=600",
    averageRating: 4.4,
    reviewCount: 156,
    totalRating: 686.4,
    tags: ["sustainable", "education", "community", "training"],
    createdAt: new Date("2024-01-04"),
  },
  {
    id: "ritual-coffee-sf",
    name: "Ritual Coffee Roasters",
    location: "San Francisco, CA",
    description:
      "Neighborhood coffee roaster committed to quality, community, and sustainability. Known for their excellent espresso and friendly atmosphere.",
    imageUrl: "/placeholder.svg?height=400&width=600",
    averageRating: 4.2,
    reviewCount: 98,
    totalRating: 411.6,
    tags: ["neighborhood", "espresso", "community", "friendly"],
    createdAt: new Date("2024-01-05"),
  },
  {
    id: "la-colombe-philadelphia",
    name: "La Colombe Coffee",
    location: "Philadelphia, PA",
    description:
      "Artisanal coffee company known for their draft lattes and innovative brewing techniques. A perfect blend of tradition and innovation.",
    imageUrl: "/placeholder.svg?height=400&width=600",
    averageRating: 4.1,
    reviewCount: 134,
    totalRating: 549.4,
    tags: ["innovative", "draft-latte", "artisanal", "tradition"],
    createdAt: new Date("2024-01-06"),
  },
]

// Sample reviews data
const reviews = [
  {
    id: "review-1",
    coffeeId: "blue-bottle-sf",
    userId: "user-demo-1",
    userName: "Coffee Enthusiast",
    userPhoto: "/placeholder.svg?height=40&width=40",
    rating: 5,
    text: "Amazing coffee! The single-origin beans are perfectly roasted and the baristas really know their craft. The atmosphere is perfect for both work and relaxation.",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "review-2",
    coffeeId: "blue-bottle-sf",
    userId: "user-demo-2",
    userName: "SF Local",
    userPhoto: "/placeholder.svg?height=40&width=40",
    rating: 4,
    text: "Great coffee and excellent service. The pour-over is exceptional, though it can get quite busy during peak hours.",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "review-3",
    coffeeId: "stumptown-portland",
    userId: "user-demo-3",
    userName: "Portland Local",
    userPhoto: "/placeholder.svg?height=40&width=40",
    rating: 4,
    text: "Great atmosphere and consistently good coffee. A Portland institution! The roasting quality is top-notch and the staff is knowledgeable.",
    createdAt: new Date("2024-01-16"),
  },
  {
    id: "review-4",
    coffeeId: "intelligentsia-chicago",
    userId: "user-demo-4",
    userName: "Coffee Connoisseur",
    userPhoto: "/placeholder.svg?height=40&width=40",
    rating: 5,
    text: "Exceptional quality and ethical sourcing. You can taste the difference in every cup. The direct trade approach really shows in the flavor profile.",
    createdAt: new Date("2024-01-18"),
  },
  {
    id: "review-5",
    coffeeId: "counter-culture-durham",
    userId: "user-demo-5",
    userName: "Durham Resident",
    userPhoto: "/placeholder.svg?height=40&width=40",
    rating: 4,
    text: "Love their commitment to education and sustainability. The cupping sessions are fantastic for learning about coffee. Great community vibe!",
    createdAt: new Date("2024-01-22"),
  },
]

async function seedData() {
  try {
    console.log("🌱 Seeding coffee shop data...")

    // Remove initialization documents first
    try {
      await deleteDoc(doc(db, "coffees", "init"))
      await deleteDoc(doc(db, "reviews", "init"))
      await deleteDoc(doc(db, "users", "init"))
      console.log("🗑️  Removed initialization documents")
    } catch (error) {
      console.log("ℹ️  No initialization documents to remove")
    }

    // Add coffee shops
    console.log("☕ Adding coffee shops...")
    for (const coffee of coffeeShops) {
      await setDoc(doc(db, "coffees", coffee.id), coffee)
      console.log(`✅ Added: ${coffee.name}`)
    }

    // Add reviews
    console.log("📝 Adding reviews...")
    for (const review of reviews) {
      await setDoc(doc(db, "reviews", review.id), review)
      console.log(`✅ Added review for: ${review.coffeeId}`)
    }

    console.log("🎉 Data seeding completed successfully!")
    console.log(`📊 Added ${coffeeShops.length} coffee shops and ${reviews.length} reviews`)
  } catch (error) {
    console.error("❌ Error seeding data:", error)
  }
}

// Run the seeding
seedData()
