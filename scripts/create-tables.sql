-- This script creates the initial Firestore collections structure
-- Note: Firestore is NoSQL, so this is a conceptual representation

-- Coffee shops collection
-- Collection: coffees
-- Document structure:
{
  "name": "string",
  "location": "string", 
  "description": "string",
  "imageUrl": "string",
  "averageRating": "number",
  "reviewCount": "number", 
  "totalRating": "number",
  "tags": ["array", "of", "strings"],
  "createdAt": "timestamp"
}

-- Reviews collection  
-- Collection: reviews
-- Document structure:
{
  "coffeeId": "string",
  "userId": "string",
  "userName": "string",
  "userPhoto": "string",
  "rating": "number",
  "text": "string", 
  "createdAt": "timestamp"
}

-- Users collection (handled by Firebase Auth)
-- Collection: users  
-- Document structure:
{
  "email": "string",
  "displayName": "string",
  "photoURL": "string",
  "createdAt": "timestamp"
}
