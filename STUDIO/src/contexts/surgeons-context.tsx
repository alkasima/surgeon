
// src/contexts/surgeons-context.tsx
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Surgeon, NewSurgeonData, Review, Location, ContactInformation, SocialMediaLinks } from '@/types/surgeon';
import { generateNewSurgeonId } from '@/lib/data';
import { ContactStatus } from '@/types/surgeon';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase'; // db can be null if Firebase fails to initialize
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface SurgeonsContextType {
  surgeons: Surgeon[];
  setSurgeons: Dispatch<SetStateAction<Surgeon[]>>;
  addSurgeon: (data: NewSurgeonData) => Promise<boolean>;
  updateSurgeon: (updatedSurgeon: Surgeon) => Promise<void>;
  deleteSurgeon: (surgeonId: string) => Promise<void>;
  toggleFavoriteSurgeon: (surgeonId: string) => Promise<void>;
  isLoading: boolean;
  selectedSurgeon: Surgeon | null;
  setSelectedSurgeon: Dispatch<SetStateAction<Surgeon | null>>;
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  openModalWithSurgeon: (surgeon: Surgeon) => void;
  importSurgeonsBatch: (surgeonsData: NewSurgeonData[]) => Promise<{ addedCount: number; skippedDuplicatesCount: number; errorCount: number; errors: string[] }>;
}

const SurgeonsContext = createContext<SurgeonsContextType | undefined>(undefined);

export const SurgeonsProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [surgeons, setSurgeons] = useState<Surgeon[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Surgeons context's own loading state
  const [selectedSurgeon, setSelectedSurgeon] = useState<Surgeon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true); // If auth is loading, surgeons data is also effectively loading
      return;
    }

    if (user) {
      if (!db) {
        console.error("SurgeonsContext: Firestore (db) is not initialized. Cannot fetch surgeons. Check Firebase configuration.");
        toast({
          title: "Firebase Error",
          description: "Firestore is not initialized. Surgeon data cannot be loaded. Please check Firebase configuration in .env.local and restart.",
          variant: "destructive",
          duration: 10000,
        });
        setSurgeons([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true); // Auth is done, user exists, db seems available, now loading surgeons
      const surgeonsColRef = collection(db, 'users', user.uid, 'surgeons');
      const unsubscribe = onSnapshot(surgeonsColRef, (snapshot) => {
        const surgeonsData = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          const outreachDate = data.outreachDate ? (data.outreachDate instanceof Timestamp ? data.outreachDate.toDate().toISOString() : data.outreachDate) : undefined;
          const responseDate = data.responseDate ? (data.responseDate instanceof Timestamp ? data.responseDate.toDate().toISOString() : data.responseDate) : undefined;
          
          return {
            ...data,
            id: docSnap.id,
            outreachDate,
            responseDate,
            location: {
              country: data.location.country,
              city: data.location.city,
              state: data.location.state === undefined ? null : data.location.state,
            },
            contactInfo: {
              email: data.contactInfo?.email || null,
              phone: data.contactInfo?.phone || null,
              website: data.contactInfo?.website || null,
              consultLink: data.contactInfo?.consultLink || null,
            },
            socialMedia: {
              instagram: data.socialMedia?.instagram || null,
              facebook: data.socialMedia?.facebook || null,
              youtube: data.socialMedia?.youtube || null,
              twitter: data.socialMedia?.twitter || null,
            },
          } as Surgeon;
        });
        setSurgeons(surgeonsData);
        setIsLoading(false); // Surgeons data loaded
      }, (error) => {
        console.error("Error fetching surgeons from Firestore:", error);
        let description = "Could not load surgeon data.";
        if (error.message?.includes("permission-denied") || error.message?.includes("Missing or insufficient permissions")) {
            description = "Failed to load surgeon data due to a permission error. Please check your Firestore security rules.";
        }
        toast({ title: "Error Loading Surgeons", description: description, variant: "destructive", duration: 10000 });
        setIsLoading(false); // Error occurred, stop loading
      });

      return () => unsubscribe();
    } else { // Auth is done, no user
      setSurgeons([]);
      setIsLoading(false); // No user, so not loading surgeons data
    }
  }, [user, authLoading, toast]);

  const addSurgeon = async (data: NewSurgeonData): Promise<boolean> => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in to add a surgeon.", variant: "destructive" });
      return false;
    }
    if (!db) {
      toast({ title: "Firebase Error", description: "Firestore not initialized. Cannot add surgeon.", variant: "destructive" });
      return false;
    }

    const newNameLower = data.name.toLowerCase().trim();
    const newClinicLower = data.clinicName.toLowerCase().trim();
    const newCityLower = data.location.city.toLowerCase().trim();
    const newCountryLower = data.location.country.toLowerCase().trim();

    const isDuplicate = surgeons.some(existingSurgeon =>
      existingSurgeon.name.toLowerCase().trim() === newNameLower &&
      existingSurgeon.clinicName.toLowerCase().trim() === newClinicLower &&
      existingSurgeon.location.city.toLowerCase().trim() === newCityLower &&
      existingSurgeon.location.country.toLowerCase().trim() === newCountryLower
    );

    if (isDuplicate) {
      return false;
    }

    const publicReviews: Review[] = [];
    if (data.reviewSource && data.reviewRating) {
      const rating = parseFloat(data.reviewRating);
      if (!isNaN(rating)) {
        const review: Review = { source: data.reviewSource, rating: rating };
        if (data.reviewCount) {
          const count = parseInt(data.reviewCount, 10);
          if (!isNaN(count)) review.count = count;
        }
        publicReviews.push(review);
      }
    }
    let yearsAsNumber: number | undefined = undefined;
    if (data.yearsInIndustry) {
        const parsedYears = parseInt(data.yearsInIndustry.match(/\d+/)?.[0] || '', 10);
        if (!isNaN(parsedYears)) yearsAsNumber = parsedYears;
    }

    const finalLocationForFirestore: Location = {
      country: data.location.country,
      city: data.location.city,
      state: data.location.country === 'US' && data.location.state && data.location.state.trim() !== '' ? data.location.state.trim() : null,
    };
    
    const finalContactInfo: ContactInformation = {
        email: data.contactInfo?.email || null,
        phone: data.contactInfo?.phone || null,
        website: data.contactInfo?.website || null,
        consultLink: data.contactInfo?.consultLink || null,
    };

    const finalSocialMedia: SocialMediaLinks = {
        instagram: data.socialMedia?.instagram || null,
        facebook: data.socialMedia?.facebook || null,
        youtube: data.socialMedia?.youtube || null,
        twitter: data.socialMedia?.twitter || null,
    };


    const newSurgeonId = generateNewSurgeonId();
    const newSurgeon: Surgeon = {
      id: newSurgeonId,
      name: data.name,
      clinicName: data.clinicName,
      location: finalLocationForFirestore,
      specialties: data.specialties ? data.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
      profileImageUrl: data.profileImageUrl || undefined, 
      contactInfo: finalContactInfo,
      socialMedia: finalSocialMedia,
      publicReviews: publicReviews,
      contactStatus: ContactStatus.None,
      outreachDate: data.outreachDate ? new Date(data.outreachDate).toISOString() : undefined, 
      responseDate: data.responseDate ? new Date(data.responseDate).toISOString() : undefined, 
      isPriceGiven: false,
      isConsultDone: false,
      isFavorite: data.isFavorite || false,
      notes: '', 
      estimatedRatePerFollicle: data.estimatedRatePerFollicle || undefined, 
      yearsInIndustry: yearsAsNumber, 
      certifications: data.certifications ? data.certifications.split(',').map(c => c.trim()).filter(Boolean) : [],
    };

    try {
      const docRef = doc(db, 'users', user.uid, 'surgeons', newSurgeonId);
      const newSurgeonForFirestore = Object.fromEntries(Object.entries(newSurgeon).filter(([_, v]) => v !== undefined));
      await setDoc(docRef, newSurgeonForFirestore);
      return true;
    } catch (error) {
      console.error("Error adding surgeon to Firestore:", error);
      toast({ title: "Error", description: `Could not add surgeon: ${(error as Error).message}`, variant: "destructive" });
      return false;
    }
  };

  const importSurgeonsBatch = async (surgeonsData: NewSurgeonData[]): Promise<{ addedCount: number; skippedDuplicatesCount: number; errorCount: number; errors: string[] }> => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in to import surgeons.", variant: "destructive" });
      return { addedCount: 0, skippedDuplicatesCount: 0, errorCount: surgeonsData.length, errors: ["User not authenticated."] };
    }
    if (!db) {
      toast({ title: "Firebase Error", description: "Firestore not initialized. Cannot import surgeons.", variant: "destructive" });
      return { addedCount: 0, skippedDuplicatesCount: 0, errorCount: surgeonsData.length, errors: ["Firestore not initialized."] };
    }


    let addedCount = 0;
    let skippedDuplicatesCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const batch = writeBatch(db);
    const surgeonsColRef = collection(db, 'users', user.uid, 'surgeons');

    const q = query(surgeonsColRef);
    const existingDocsSnapshot = await getDocs(q);
    const existingSurgeons = existingDocsSnapshot.docs.map(d => d.data() as Surgeon);

    for (let i = 0; i < surgeonsData.length; i++) {
      const data = surgeonsData[i];
      const newNameLower = data.name.toLowerCase().trim();
      const newClinicLower = data.clinicName.toLowerCase().trim();
      const newCityLower = data.location.city.toLowerCase().trim();
      const newCountryLower = data.location.country.toLowerCase().trim();

      const isDuplicate = existingSurgeons.some(existingSurgeon =>
        existingSurgeon.name.toLowerCase().trim() === newNameLower &&
        existingSurgeon.clinicName.toLowerCase().trim() === newClinicLower &&
        existingSurgeon.location.city.toLowerCase().trim() === newCityLower &&
        existingSurgeon.location.country.toLowerCase().trim() === newCountryLower
      );

      if (isDuplicate) {
        skippedDuplicatesCount++;
        errors.push(`Row ${i + 2} (Name: ${data.name}): Skipped due to duplicate.`);
        continue;
      }

      const publicReviews: Review[] = [];
      if (data.reviewSource && data.reviewRating) {
        const rating = parseFloat(data.reviewRating);
        if (!isNaN(rating)) {
          const review: Review = { source: data.reviewSource, rating: rating };
          if (data.reviewCount) {
            const count = parseInt(data.reviewCount, 10);
            if (!isNaN(count)) review.count = count;
          }
          publicReviews.push(review);
        }
      }
      let yearsAsNumber: number | undefined = undefined;
      if (data.yearsInIndustry) {
          const parsedYears = parseInt(data.yearsInIndustry.match(/\d+/)?.[0] || '', 10);
          if (!isNaN(parsedYears)) yearsAsNumber = parsedYears;
      }

      const finalLocationForFirestore: Location = {
        country: data.location.country,
        city: data.location.city,
        state: data.location.country === 'US' && data.location.state && data.location.state.trim() !== '' ? data.location.state.trim() : null,
      };

      const finalContactInfo: ContactInformation = {
        email: data.contactInfo?.email || null,
        phone: data.contactInfo?.phone || null,
        website: data.contactInfo?.website || null,
        consultLink: data.contactInfo?.consultLink || null,
      };

      const finalSocialMedia: SocialMediaLinks = {
          instagram: data.socialMedia?.instagram || null,
          facebook: data.socialMedia?.facebook || null,
          youtube: data.socialMedia?.youtube || null,
          twitter: data.socialMedia?.twitter || null,
      };

      const newSurgeonId = generateNewSurgeonId();
      const newSurgeon: Surgeon = {
        id: newSurgeonId,
        name: data.name,
        clinicName: data.clinicName,
        location: finalLocationForFirestore,
        specialties: data.specialties ? data.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
        profileImageUrl: data.profileImageUrl || undefined,
        contactInfo: finalContactInfo,
        socialMedia: finalSocialMedia,
        publicReviews: publicReviews,
        contactStatus: ContactStatus.None,
        outreachDate: data.outreachDate ? new Date(data.outreachDate).toISOString() : undefined,
        responseDate: data.responseDate ? new Date(data.responseDate).toISOString() : undefined,
        isPriceGiven: false,
        isConsultDone: false,
        isFavorite: data.isFavorite || false,
        notes: '',
        estimatedRatePerFollicle: data.estimatedRatePerFollicle || undefined,
        yearsInIndustry: yearsAsNumber,
        certifications: data.certifications ? data.certifications.split(',').map(c => c.trim()).filter(Boolean) : [],
      };
      const docRef = doc(surgeonsColRef, newSurgeonId);
      const newSurgeonForFirestore = Object.fromEntries(Object.entries(newSurgeon).filter(([_, v]) => v !== undefined));
      batch.set(docRef, newSurgeonForFirestore);
      addedCount++;
    }

    try {
      await batch.commit();
    } catch (error) {
      console.error("Error committing batch import to Firestore:", error);
      errorCount = surgeonsData.length - skippedDuplicatesCount;
      addedCount = 0;
      errors.push(`Batch commit failed: ${(error as Error).message}. Check Firestore console for details.`);
      toast({ title: "Batch Import Error", description: `Could not save surgeons: ${(error as Error).message}`, variant: "destructive", duration: 10000 });
    }
    return { addedCount, skippedDuplicatesCount, errorCount, errors };
  };

  const updateSurgeon = async (updatedSurgeon: Surgeon) => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in.", variant: "destructive" });
      return;
    }
     if (!db) {
      toast({ title: "Firebase Error", description: "Firestore not initialized. Cannot update surgeon.", variant: "destructive" });
      return;
    }
    if (!updatedSurgeon.id) {
      console.error("Update failed: Surgeon ID is missing.", updatedSurgeon);
      toast({ title: "Error", description: "Surgeon ID missing, cannot update.", variant: "destructive" });
      return;
    }

    const finalLocationForFirestore: Location = {
        country: updatedSurgeon.location.country,
        city: updatedSurgeon.location.city,
        state: updatedSurgeon.location.country === 'US' && updatedSurgeon.location.state && String(updatedSurgeon.location.state).trim() !== '' ? String(updatedSurgeon.location.state).trim() : null,
    };

    const finalContactInfo: ContactInformation = {
        email: updatedSurgeon.contactInfo?.email || null,
        phone: updatedSurgeon.contactInfo?.phone || null,
        website: updatedSurgeon.contactInfo?.website || null,
        consultLink: updatedSurgeon.contactInfo?.consultLink || null,
    };

    const finalSocialMedia: SocialMediaLinks = {
        instagram: updatedSurgeon.socialMedia?.instagram || null,
        facebook: updatedSurgeon.socialMedia?.facebook || null,
        youtube: updatedSurgeon.socialMedia?.youtube || null,
        twitter: updatedSurgeon.socialMedia?.twitter || null,
    };

    const dataToUpdate: Partial<Surgeon> = { 
      ...updatedSurgeon,
      location: finalLocationForFirestore,
      contactInfo: finalContactInfo,
      socialMedia: finalSocialMedia,
      outreachDate: updatedSurgeon.outreachDate ? new Date(updatedSurgeon.outreachDate).toISOString() : undefined,
      responseDate: updatedSurgeon.responseDate ? new Date(updatedSurgeon.responseDate).toISOString() : undefined,
      notes: updatedSurgeon.notes || '', 
    };

    const dataToUpdateForFirestore = Object.fromEntries(Object.entries(dataToUpdate).filter(([_, v]) => v !== undefined));


    try {
      const docRef = doc(db, 'users', user.uid, 'surgeons', updatedSurgeon.id);
      await setDoc(docRef, dataToUpdateForFirestore, { merge: true });
    } catch (error) {
      console.error("Error updating surgeon in Firestore:", error);
      toast({ title: "Error", description: `Could not update surgeon: ${(error as Error).message}`, variant: "destructive" });
    }
  };

  const deleteSurgeon = async (surgeonId: string) => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in.", variant: "destructive" });
      return;
    }
     if (!db) {
      toast({ title: "Firebase Error", description: "Firestore not initialized. Cannot delete surgeon.", variant: "destructive" });
      return;
    }
    try {
      const docRef = doc(db, 'users', user.uid, 'surgeons', surgeonId);
      await deleteDoc(docRef);
      if (selectedSurgeon && selectedSurgeon.id === surgeonId) {
        setSelectedSurgeon(null);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting surgeon from Firestore:", error);
      toast({ title: "Error", description: "Could not delete surgeon.", variant: "destructive" });
    }
  };

  const toggleFavoriteSurgeon = async (surgeonId: string) => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (!db) {
      toast({ title: "Firebase Error", description: "Firestore not initialized. Cannot toggle favorite.", variant: "destructive" });
      return;
    }
    const surgeonToUpdate = surgeons.find(s => s.id === surgeonId);
    if (!surgeonToUpdate) {
      toast({ title: "Error", description: "Surgeon not found.", variant: "destructive" });
      return;
    }

    try {
      const docRef = doc(db, 'users', user.uid, 'surgeons', surgeonId);
      await setDoc(docRef, { isFavorite: !surgeonToUpdate.isFavorite }, { merge: true });
    } catch (error) {
      console.error("Error toggling favorite in Firestore:", error);
      toast({ title: "Error", description: "Could not update favorite status.", variant: "destructive" });
    }
  };

  const openModalWithSurgeon = (surgeon: Surgeon) => {
    setSelectedSurgeon(surgeon);
    setIsModalOpen(true);
  };

  return (
    <SurgeonsContext.Provider value={{
        surgeons,
        setSurgeons,
        addSurgeon,
        updateSurgeon,
        deleteSurgeon,
        toggleFavoriteSurgeon,
        isLoading,
        selectedSurgeon,
        setSelectedSurgeon,
        isModalOpen,
        setIsModalOpen,
        openModalWithSurgeon,
        importSurgeonsBatch
    }}>
      {children}
    </SurgeonsContext.Provider>
  );
};

export const useSurgeons = (): SurgeonsContextType => {
  const context = useContext(SurgeonsContext);
  if (context === undefined) {
    throw new Error('useSurgeons must be used within a SurgeonsProvider');
  }
  return context;
};

