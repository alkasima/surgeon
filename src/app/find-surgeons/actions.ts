// src/app/find-surgeons/actions.ts
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import type { NewSavedSearchData } from '@/types/search';

export async function saveSearchQueryAction(data: NewSavedSearchData): Promise<{ success: boolean; error?: string; searchId?: string }> {
  if (!data.userId) {
    return { success: false, error: "User not authenticated." };
  }
  if (!db) {
    // This case should ideally not happen if Firebase is initialized correctly.
    console.error("saveSearchQueryAction: Firestore (db) is not initialized.");
    return { success: false, error: "Firestore not initialized. Please check server logs." };
  }
  if (!data.searchTerm && !data.locationTerm) {
    return { success: false, error: "Either a search term or a location term must be provided to save a search." };
  }

  try {
    const docRef = await addDoc(collection(db, 'users', data.userId, 'savedSearches'), {
      searchTerm: data.searchTerm || "", // Ensure empty string if undefined
      locationTerm: data.locationTerm || "", // Ensure empty string if undefined
      createdAt: Timestamp.now(),
    });
    return { success: true, searchId: docRef.id };
  } catch (error) {
    console.error("Error saving search query to Firestore:", error);
    let errorMessage = "Could not save the search query due to a server error.";
    if (error instanceof Error) {
        errorMessage = error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions")
            ? "Permission denied. You might not have access to save searches."
            : `Could not save search: ${error.message}`;
    }
    return { success: false, error: errorMessage };
  }
}
