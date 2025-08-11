
// src/types/search.ts
import type { Timestamp } from 'firebase/firestore';

export interface SavedSearch {
  id: string; // Firestore document ID
  searchTerm: string;
  locationTerm: string;
  createdAt: Timestamp;
  // userId is implicit via the path users/{userId}/savedSearches
}

export interface NewSavedSearchData {
  userId: string; // ID of the user saving the search
  searchTerm: string;
  locationTerm: string;
}
