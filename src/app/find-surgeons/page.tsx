// src/app/find-surgeons/page.tsx
"use client";

import { useState, useMemo, type ChangeEvent } from 'react';
import { ModernLayout } from '@/components/layout/modern-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SurgeonsProvider, useSurgeons } from '@/contexts/surgeons-context';
import { useToast } from '@/hooks/use-toast';
import type { NewSurgeonData } from '@/types/surgeon';
import { Loader2, Search, Star, MessageCircle, ListFilter, ExternalLink, Bookmark, CreditCard, Plus, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
// Server actions are called through the user context
import { saveSearchQueryAction } from './actions';
import { COUNTRIES } from '@/lib/constants'; // Import COUNTRIES
import { InsufficientSearchCreditsDialog } from '@/components/credits/insufficient-search-credits-dialog';

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  website?: string;
  international_phone_number?: string;
  address_components?: AddressComponent[];
  rating?: number;
  user_ratings_total?: number;
}

interface ApiSearchResult {
  id: string; 
  name: string;
  clinicName?: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
}

const API_SORT_OPTIONS = [
  { value: 'default', label: "Default (Prominence)" },
  { value: 'reviews_high_low', label: "⭐ Most Reviews" },
  { value: 'reviews_low_high', label: "⭐ Least Reviews" },
  { value: 'rating_high_low', label: "🌟 Highest Rating" },
  { value: 'rating_low_high', label: "🌟 Lowest Rating" },
  { value: 'name_asc', label: "📝 Name A-Z" },
  { value: 'name_desc', label: "📝 Name Z-A" },
];

const SPECIALTY_OPTIONS = ["Hair Transplant", "Scalp Micropigmentation", "ARTAS"];


function parseAddressComponents(addressComponents?: AddressComponent[]): { city: string; state: string; country: string } {
  let gCity = '';
  let gState = '';
  let gCountryLong = '';
  let gCountryShort = '';
  let parsedCountry = '';

  if (addressComponents) {
    for (const component of addressComponents) {
      const types = component.types;
      if (!gCity && (types.includes('locality') || types.includes('postal_town') || types.includes('administrative_area_level_3'))) {
        gCity = component.long_name;
      }
      if (!gState && types.includes('administrative_area_level_1')) {
        gState = component.short_name; // e.g., "CA"
      }
      if (!gCountryShort && types.includes('country')) {
        gCountryLong = component.long_name; // e.g., "United States"
        gCountryShort = component.short_name; // e.g., "US"
      }
    }
     // A fallback for city if not found yet by common types
    if (!gCity) {
        const adminLevel2 = addressComponents.find(c => c.types.includes('administrative_area_level_2'));
        if (adminLevel2) {
            gCity = adminLevel2.long_name;
        }
    }
  }

  const countryShortMatch = COUNTRIES.find(c => c.value.toUpperCase() === gCountryShort.toUpperCase());
  if (countryShortMatch) {
    parsedCountry = countryShortMatch.value;
  } else {
    const countryLongMatch = COUNTRIES.find(c => c.value.toUpperCase() === gCountryLong.toUpperCase() || c.label.toUpperCase() === gCountryLong.toUpperCase());
    if (countryLongMatch) {
      parsedCountry = countryLongMatch.value;
    } else {
      parsedCountry = gCountryShort || gCountryLong;
    }
  }
  
  const finalState = (parsedCountry === 'US' && gState) ? gState : '';

  return { city: gCity, state: finalState, country: parsedCountry };
}


function FindSurgeonsContent() {
  const { addSurgeon } = useSurgeons();
  const { user } = useAuth();
  const { userData, refreshUserData, checkAndUseCredits } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSavingSearch, setIsSavingSearch] = useState(false);
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [searchResults, setSearchResults] = useState<ApiSearchResult[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState(API_SORT_OPTIONS[0].value);
  const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] = useState(false);

  const processApiResponse = (data: any): ApiSearchResult[] => {
    if (data.results) {
      return data.results.map((place: PlaceResult) => {
        const { city, state, country } = parseAddressComponents(place.address_components);
        return {
          id: place.place_id,
          name: place.name,
          clinicName: place.name, // Default clinic name to place name
          address: place.formatted_address,
          city: city || undefined,
          state: state || undefined,
          country: country || undefined,
          phone: place.international_phone_number,
          website: place.website,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
        };
      });
    }
    return [];
  };
  
  const fetchPlaces = async (currentToken: string | null = null) => {
    if (currentToken) {
      setIsFetchingMore(true);
    } else {
      setSearchResults([]);
      setNextPageToken(null);
    }

    try {
      let localApiUrl = '/api/places?';
      const params = new URLSearchParams();

      if (currentToken) {
        params.append('pagetoken', currentToken);
      } else {
        const queryParts = [];
        if (searchTerm) queryParts.push(searchTerm);
        if (locationTerm) queryParts.push(`in ${locationTerm}`);
        const combinedQuery = queryParts.join(' ');
        
        params.append('query', combinedQuery);
        const radiusInMeters = 48280; // 30 miles
        params.append('radius', radiusInMeters.toString());
      }
      localApiUrl += params.toString();

      const response = await fetch(localApiUrl);
      const contentType = response.headers.get("content-type");

      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error(`FindSurgeons: API request failed or returned non-JSON. Status ${response.status}. Response text:`, errorText.substring(0, 500));
        toast({
          title: "API Error",
          description: `Search failed (status ${response.status}). ${errorText.length < 100 ? errorText : 'Check console for details.'}`,
          variant: "destructive",
          duration: 10000,
        });
      } else {
        const data = await response.json();
        const mappedResults = processApiResponse(data);

        if (currentToken) {
          setSearchResults(prevResults => [...prevResults, ...mappedResults]);
        } else {
          setSearchResults(mappedResults);
        }
        setNextPageToken(data.next_page_token || null);

        if (mappedResults.length === 0 && data.status === "ZERO_RESULTS") {
          toast({ title: "No Results", description: currentToken ? "No more places found." : "No places found matching your criteria." });
        } else if (data.error_message) {
          console.error("FindSurgeons: Google API Error:", data.error_message);
          toast({ title: "Google Places API Error", description: data.error_message, variant: "destructive" });
        }
      }
    } catch (error) {
      console.error("FindSurgeons: Error during fetch or processing:", error);
      toast({
        title: "Search Failed",
        description: (error instanceof Error) ? error.message : "An unexpected error occurred. Check console.",
        variant: "destructive"
      });
    } finally {
      if (currentToken) {
        setIsFetchingMore(false);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchTerm && !locationTerm) {
      toast({ title: "Search Term Required", description: "Please enter a specialty/name or location to search.", variant: "destructive" });
      return;
    }

    if (!user?.uid) {
      toast({ title: "Authentication Required", description: "Please log in to search for surgeons.", variant: "destructive" });
      return;
    }

    // Check and use credits for search
    const hasCredits = await checkAndUseCredits('surgeonSearch');
    if (!hasCredits) {
      // Error handling is done in the context
      return;
    }

    setIsSearching(true);
    try {

      // Perform the search
      await fetchPlaces(null);
      
      // Refresh user data to show updated credits
      await refreshUserData();
      
    } catch (error) {
      console.error("An error occurred during the search process:", error);
      toast({ title: "Search Error", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadMore = async () => {
    if (!nextPageToken) return;
    
    if (!user?.uid) {
      toast({ title: "Authentication Required", description: "Please log in to load more results.", variant: "destructive" });
      return;
    }

    // Check and use credits for loading more
    const hasCredits = await checkAndUseCredits('surgeonSearch');
    if (!hasCredits) {
      // Error handling is done in the context
      return;
    }

    setIsFetchingMore(true);
    try {

      // Load more results
      await fetchPlaces(nextPageToken);
      
      // Refresh user data to show updated credits
      await refreshUserData();
      
    } catch (error) {
      console.error("Error loading more results:", error);
      toast({ title: "Load More Error", description: "Failed to load more results. Please try again.", variant: "destructive" });
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleSaveSearch = async () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "You must be logged in to save searches.", variant: "destructive" });
      return;
    }
    if (!searchTerm && !locationTerm) {
      toast({ title: "Cannot Save Empty Search", description: "Please enter a search term or location.", variant: "destructive" });
      return;
    }

    setIsSavingSearch(true);
    try {
      const result = await saveSearchQueryAction({
        userId: user.uid,
        searchTerm: searchTerm,
        locationTerm: locationTerm,
      });
      if (result.success) {
        toast({ title: "Search Saved", description: "Your search criteria have been saved." });
      } else {
        toast({ title: "Error Saving Search", description: result.error || "An unknown error occurred.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save search. Check console.", variant: "destructive" });
      console.error("Failed to save search:", error);
    }
    setIsSavingSearch(false);
  };

  const handleAddSurgeonFromApi = async (apiResult: ApiSearchResult) => {
    const newSurgeon: NewSurgeonData = {
      name: apiResult.name,
      clinicName: apiResult.clinicName || apiResult.name,
      location: {
        city: apiResult.city || 'Unknown City',
        country: apiResult.country || 'Unknown Country',
        state: apiResult.state,
      },
      contactInfo: {
        phone: apiResult.phone,
        website: apiResult.website,
      },
      reviewRating: apiResult.rating?.toString(),
      reviewCount: apiResult.user_ratings_total?.toString(),
      reviewSource: "Google Places",
    };

    const wasAdded = await addSurgeon(newSurgeon);

    if (wasAdded) {
      toast({
        title: "Surgeon Added",
        description: `${newSurgeon.name} has been added to your list. You can edit details from the dashboard.`,
      });
    } else {
      toast({
        title: "Duplicate Surgeon or Error",
        description: `${newSurgeon.name} may already exist in your list with the same clinic, city, and country, or an error occurred.`,
        variant: "destructive",
      });
    }
  };

  const handleAddAllSurgeons = async () => {
    if (sortedAndFilteredSearchResults.length === 0) {
      toast({
        title: "No Results",
        description: "No surgeons to add. Please search first.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingAll(true);
    let addedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    try {
      for (const result of sortedAndFilteredSearchResults) {
        const newSurgeon: NewSurgeonData = {
          name: result.name,
          clinicName: result.clinicName || result.name,
          location: {
            city: result.city || 'Unknown City',
            country: result.country || 'Unknown Country',
            state: result.state,
          },
          contactInfo: {
            phone: result.phone,
            website: result.website,
          },
          reviewRating: result.rating?.toString(),
          reviewCount: result.user_ratings_total?.toString(),
          reviewSource: "Google Places",
        };

        const wasAdded = await addSurgeon(newSurgeon);
        if (wasAdded) {
          addedCount++;
        } else {
          duplicateCount++;
        }
      }

      // Show summary toast
      if (addedCount > 0) {
        toast({
          title: "Bulk Add Complete",
          description: `Successfully added ${addedCount} surgeons. ${duplicateCount} were already in your list.`,
        });
      } else if (duplicateCount > 0) {
        toast({
          title: "All Surgeons Already Added",
          description: `All ${duplicateCount} surgeons were already in your list.`,
        });
      }
    } catch (error) {
      console.error("Error adding surgeons:", error);
      toast({
        title: "Error Adding Surgeons",
        description: `Added ${addedCount} surgeons, but encountered errors with ${errorCount} surgeons.`,
        variant: "destructive",
      });
    } finally {
      setIsAddingAll(false);
    }
  };
  
  const handleSpecialtyClick = (specialty: string) => {
    if (selectedSpecialty === specialty) {
      setSelectedSpecialty('');
      setSearchTerm('');
    } else {
      setSelectedSpecialty(specialty);
      setSearchTerm(specialty);
    }
  };

  const handleSearchTermChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (selectedSpecialty) {
      setSelectedSpecialty('');
    }
  };

  const sortedAndFilteredSearchResults = useMemo(() => {
    let sorted = [...searchResults];
    
    switch (sortOption) {
      case 'reviews_high_low':
        sorted.sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0));
        break;
      case 'reviews_low_high':
        sorted.sort((a, b) => (a.user_ratings_total || 0) - (b.user_ratings_total || 0));
        break;
      case 'rating_high_low':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'rating_low_high':
        sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        break;
      case 'name_asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'default':
      default:
        // Keep original order (Google's prominence ranking)
        break;
    }
    
    return sorted;
  }, [searchResults, sortOption]);

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="flex items-center gap-3 p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Find Surgeons</h1>
            <p className="text-sm text-muted-foreground">Search Google Places for new surgeons to add</p>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {userData?.credits || 0} credits
            </span>
          </div>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <Card className="max-w-3xl mx-auto">
           <CardHeader>
              <CardTitle className="text-2xl font-headline">Find New Surgeons (via Google Places)</CardTitle>
              <CardDescription>
                Search for surgeons by specialty/name and location. Results are provided by Google Places.
                <br />
                <span className="text-amber-600 font-medium">⚠️ Each search and "Load More" costs 5 search credits.</span>
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="searchTerm">Specialty or Surgeon/Clinic Name</Label>
              <Input
                id="searchTerm"
                placeholder="e.g., FUE, Dr. John Doe, or select a specialty below"
                value={searchTerm}
                onChange={handleSearchTermChange}
                disabled={isSearching || isFetchingMore || isSavingSearch}
              />
              <div className="flex flex-wrap gap-2 pt-2">
                {SPECIALTY_OPTIONS.map((specialty) => (
                  <Button
                    key={specialty}
                    variant={selectedSpecialty === specialty ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSpecialtyClick(specialty)}
                    disabled={isSearching || isFetchingMore || isSavingSearch}
                  >
                    {specialty}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationTerm">City, State, or Country (e.g., Sacramento)</Label>
              <Input
                id="locationTerm"
                placeholder="e.g., Sacramento, CA or Istanbul, Turkey"
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
                disabled={isSearching || isFetchingMore || isSavingSearch}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || isFetchingMore || isSavingSearch || (!searchTerm && !locationTerm)} 
                className="w-full sm:w-auto"
              >
                {isSearching ? (
                  <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching... </>
                ) : (
                  <> <Search className="mr-2 h-4 w-4" /> Search Surgeons </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveSearch} 
                disabled={isSavingSearch || isSearching || isFetchingMore || (!searchTerm && !locationTerm) || !user}
                className="w-full sm:w-auto"
                title={!user ? "Login to save searches" : (!searchTerm && !locationTerm) ? "Enter search terms to save" : "Save this search"}
              >
                {isSavingSearch ? (
                   <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving... </>
                ) : (
                   <> <Bookmark className="mr-2 h-4 w-4" /> Save This Search </>
                )}
              </Button>
              <Select value={sortOption} onValueChange={setSortOption} disabled={isSearching || isFetchingMore || searchResults.length === 0 || isSavingSearch || isAddingAll}>
                <SelectTrigger className="w-full sm:w-auto sm:min-w-[200px]">
                  <ListFilter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  {API_SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {(isSearching && searchResults.length === 0) && (
          <div className="text-center py-4 max-w-3xl mx-auto">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Searching for surgeons...</p>
          </div>
        )}

        {sortedAndFilteredSearchResults.length > 0 && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Search Results ({sortedAndFilteredSearchResults.length})</CardTitle>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={isAddingAll || isSearching || isFetchingMore || isSavingSearch}
                      className="bg-green-600 hover:bg-green-500 text-white"
                    >
                      {isAddingAll ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding All...
                        </>
                      ) : (
                        <>
                          <Users className="mr-2 h-4 w-4" />
                          Add All Surgeons
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Add All {sortedAndFilteredSearchResults.length} Surgeons?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will add all {sortedAndFilteredSearchResults.length} surgeons from your search results to your personal list. 
                        Surgeons that already exist in your list will be skipped.
                        <br /><br />
                        <strong>This action cannot be undone.</strong>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleAddAllSurgeons}
                        className="bg-green-600 hover:bg-green-500"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Add All {sortedAndFilteredSearchResults.length} Surgeons
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedAndFilteredSearchResults.map((result) => (
                <Card key={result.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-start gap-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">{result.name}</h3>
                    <p className="text-sm text-muted-foreground">{result.address}</p>
                    {result.city && result.country && (
                       <p className="text-xs text-muted-foreground">
                        Parsed Location: {result.city}{result.state ? `, ${result.state}` : ''}, {result.country}
                       </p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 items-center">
                        {result.website && <Button variant="link" asChild className="p-0 h-auto text-sm"><a href={result.website} target="_blank" rel="noopener noreferrer">Website <ExternalLink className="ml-1 h-3 w-3" /></a></Button>}
                        {result.phone && <span className="text-sm text-muted-foreground">{result.phone}</span>}
                        <Button variant="link" asChild className="p-0 h-auto text-sm">
                            <a href={`https://www.google.com/maps/place/?q=place_id:${result.id}`} target="_blank" rel="noopener noreferrer">
                                View on Google <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                        </Button>
                    </div>
                     <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 items-center text-xs text-muted-foreground">
                        {typeof result.rating === 'number' && (
                            <span className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" /> {result.rating.toFixed(1)}
                            </span>
                        )}
                        {typeof result.user_ratings_total === 'number' && (
                             <span className="flex items-center gap-1">
                                <MessageCircle className="h-3.5 w-3.5" /> {result.user_ratings_total} reviews
                             </span>
                        )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleAddSurgeonFromApi(result)} 
                    disabled={isAddingAll || isSearching || isFetchingMore || isSavingSearch}
                    className="w-full sm:w-auto flex-shrink-0 mt-2 sm:mt-0 self-center sm:self-auto"
                  >
                    {isAddingAll ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-3 w-3" />
                        Add to My List
                      </>
                    )}
                  </Button>
                </Card>
              ))}
              {nextPageToken && (
                <Button onClick={handleLoadMore} disabled={isFetchingMore || isSearching || isSavingSearch || isAddingAll} className="w-full mt-4">
                  {isFetchingMore ? (
                    <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading More... </>
                  ) : (
                    "Load More Results"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        
        {(!isSearching && searchResults.length === 0 && (searchTerm || locationTerm)) && (
             <Card className="max-w-3xl mx-auto">
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                        No surgeons found for your current search criteria.
                    </p>
                </CardContent>
             </Card>
        )}
        
        {/* Insufficient Search Credits Dialog */}
        <InsufficientSearchCreditsDialog
          isOpen={showInsufficientCreditsDialog}
          onClose={() => setShowInsufficientCreditsDialog(false)}
          creditsNeeded={1}
          featureName="Surgeon Search"
          currentCredits={userData?.credits || 0}
        />
      </div>
    </div>
  );
}

export default function FindSurgeonsPage() {
  return (
    <ModernLayout>
      <FindSurgeonsContent />
    </ModernLayout>
  );
}
