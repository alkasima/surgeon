
export enum ContactStatus {
  None = "None",
  Contacted = "Contacted",
  Responded = "Responded",
  PriceGiven = "Price Given",
  ConsultDone = "Consult Done",
  Archived = "Archived",
}

export interface Location {
  country: string;
  state?: string; 
  city: string;
}

export interface Review {
  source: string; 
  rating: number; 
  count?: number; 
  link?: string;
}

export interface ContactInformation {
  email?: string;
  phone?: string;
  website?: string;
  consultLink?: string; 
}

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
}

export interface Surgeon {
  id: string; // Firestore document ID
  name: string;
  clinicName: string;
  location: Location;
  specialties: string[];
  publicReviews: Review[];
  // Tracking Info
  contactStatus: ContactStatus;
  outreachDate?: string; // ISO date string
  responseDate?: string; // ISO date string
  personalRating?: number; // 1-5 stars
  costEstimate?: string;
  actualCost?: string;
  notes?: string;
  isPriceGiven: boolean;
  isConsultDone: boolean;
  isFavorite?: boolean;
  // Contact & Links
  contactInfo: ContactInformation; // Should not be optional at top level
  socialMedia: SocialMediaLinks;   // Should not be optional at top level
  profileImageUrl?: string;
  // New fields
  estimatedRatePerFollicle?: string;
  yearsInIndustry?: number;
  certifications?: string[];
  // userId?: string; // Not needed if data is in users/{userId}/surgeons
}

export interface NewSurgeonData {
  name: string;
  clinicName: string;
  location: {
    country: string;
    state?: string;
    city: string;
  };
  specialties?: string; 
  profileImageUrl?: string;
  contactInfo?: Partial<ContactInformation>;
  socialMedia?: Partial<SocialMediaLinks>;
  isFavorite?: boolean;
  estimatedRatePerFollicle?: string;
  yearsInIndustry?: string; 
  certifications?: string; 
  reviewRating?: string; 
  reviewCount?: string;  
  reviewSource?: string;
  // Fields for tracking that might be included in CSV
  outreachDate?: string; // ISO date string or YYYY-MM-DD from CSV
  responseDate?: string; // ISO date string or YYYY-MM-DD from CSV
}
