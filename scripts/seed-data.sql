-- Sample data for Firestore collections
-- This represents the data structure for seeding

-- Sample coffee shops
INSERT INTO coffees (conceptual):
{
  "name": "Blue Bottle Coffee",
  "location": "San Francisco, CA",
  "description": "Artisanal coffee roasted to perfection with a focus on quality and sustainability.",
  "imageUrl": "https://example.com/blue-bottle.jpg",
  "averageRating": 4.5,
  "reviewCount": 127,
  "totalRating": 571.5,
  "tags": ["artisanal", "sustainable", "single-origin"],
  "createdAt": "2024-01-01T00:00:00Z"
}

{
  "name": "Stumptown Coffee Roasters", 
  "location": "Portland, OR",
  "description": "Pioneer of the third wave coffee movement with exceptional roasting techniques.",
  "imageUrl": "https://example.com/stumptown.jpg",
  "averageRating": 4.3,
  "reviewCount": 89,
  "totalRating": 382.7,
  "tags": ["third-wave", "roastery", "specialty"],
  "createdAt": "2024-01-02T00:00:00Z"
}

{
  "name": "Intelligentsia Coffee",
  "location": "Chicago, IL", 
  "description": "Direct trade coffee with a commitment to quality and farmer relationships.",
  "imageUrl": "https://example.com/intelligentsia.jpg",
  "averageRating": 4.6,
  "reviewCount": 203,
  "totalRating": 933.8,
  "tags": ["direct-trade", "quality", "specialty"],
  "createdAt": "2024-01-03T00:00:00Z"
}

-- Sample reviews
INSERT INTO reviews (conceptual):
{
  "coffeeId": "blue-bottle-sf",
  "userId": "user123",
  "userName": "Coffee Enthusiast",
  "userPhoto": "https://example.com/user1.jpg",
  "rating": 5,
  "text": "Amazing coffee! The single-origin beans are perfectly roasted and the baristas really know their craft.",
  "createdAt": "2024-01-15T10:30:00Z"
}

{
  "coffeeId": "stumptown-portland", 
  "userId": "user456",
  "userName": "Portland Local",
  "userPhoto": "https://example.com/user2.jpg", 
  "rating": 4,
  "text": "Great atmosphere and consistently good coffee. A Portland institution!",
  "createdAt": "2024-01-16T14:20:00Z"
}
