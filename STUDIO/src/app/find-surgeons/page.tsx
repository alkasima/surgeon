
// src/app/find-surgeons/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SurgeonsProvider, useSurgeons } from '@/contexts/surgeons-context';
import { useToast } from '@/hooks/use-toast';
import type { NewSurgeonData } from '@/types/surgeon';
import { Loader2, Search, Star, MessageCircle, ListFilter, ExternalLink, Bookmark } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { saveSearchQueryAction } from './actions';
import { COUNTRIES } from '@/lib/constants'; // Import COUNTRIES

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
  { value: 'reviews_high_low', label: "Reviews: High to Low" },
  { value: 'rating_high_low', label: "Rating: High to Low" },
];


function parseAddressComponents(addressComponents?: AddressComponent[]): { city: string; state: string; country: string } {
  let gCity = '';
  let gState = '';
  let gCountryLong = '';
  let gCountryShort = '';
  let parsedCountry = '';

  if (addressComponents) {
    for (const component of addressComponents) {
      if (component.types.includes('locality') || component.types.includes('postal_town')) {
        gCity = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        gState = component.short_name; // e.g., "CA"
      }
      if (component.types.includes('country')) {
        gCountryLong = component.long_name; // e.g., "United States"
        gCountryShort = component.short_name; // e.g., "US"
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
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSavingSearch, setIsSavingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<ApiSearchResult[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState(API_SORT_OPTIONS[0].value);

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

    setIsSearching(true);
    try {
      await fetchPlaces(null);
    } catch (error) {
      console.error("An error occurred during the search process:", error);
      toast({ title: "Search Error", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadMore = () => {
    if (nextPageToken) {
      fetchPlaces(nextPageToken);
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

  const sortedAndFilteredSearchResults = useMemo(() => {
    let sorted = [...searchResults];
    if (sortOption === 'reviews_high_low') {
      sorted.sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0));
    } else if (sortOption === 'rating_high_low') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return sorted;
  }, [searchResults, sortOption]);

  return (
    <MainLayout>
      <div className="space-y-8">
        <Card className="max-w-3xl mx-auto">
           <CardHeader>
              <CardTitle className="text-2xl font-headline">Find New Surgeons (via Google Places)</CardTitle>
              <CardDescription>
                Search for surgeons by specialty/name and location. Results are provided by Google Places.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="searchTerm">Specialty or Surgeon/Clinic Name</Label>
              <Input
                id="searchTerm"
                placeholder="e.g., Hair Transplant, FUE, Dr. John Doe"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isSearching || isFetchingMore || isSavingSearch}
              />
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
              <Select value={sortOption} onValueChange={setSortOption} disabled={isSearching || isFetchingMore || searchResults.length === 0 || isSavingSearch}>
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
              <CardTitle>Search Results ({sortedAndFilteredSearchResults.length})</CardTitle>
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
                  <Button size="sm" onClick={() => handleAddSurgeonFromApi(result)} className="w-full sm:w-auto flex-shrink-0 mt-2 sm:mt-0 self-center sm:self-auto">Add to My List</Button>
                </Card>
              ))}
              {nextPageToken && (
                <Button onClick={handleLoadMore} disabled={isFetchingMore || isSearching || isSavingSearch} className="w-full mt-4">
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
      </div>
    </MainLayout>
  );
}

export default function FindSurgeonsPage() {
  return (
    <SurgeonsProvider>
      <FindSurgeonsContent />
    </SurgeonsProvider>
  );
}
