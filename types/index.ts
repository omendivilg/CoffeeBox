export interface Coffee {
  id: string
  name: string
  location: string
  description?: string
  imageUrl?: string
  averageRating: number
  reviewCount: number
  totalRating: number
  tags?: string[]
  createdAt?: any
}

export interface Review {
  id: string
  coffeeId: string
  userId: string
  userName: string
  userPhoto?: string
  rating: number
  text?: string
  createdAt: any // Puede ser Date, Timestamp de Firestore, o string
}

export interface User {
  id: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt: any
}
