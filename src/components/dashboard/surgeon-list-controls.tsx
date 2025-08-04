
// src/components/dashboard/surgeon-list-controls.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CONTACT_STATUS_OPTIONS, COUNTRIES, SORT_OPTIONS, USA_STATES } from "@/lib/constants";
import { Filter, Search, X, ListFilter, Star } from "lucide-react"; 
import type React from 'react';
import { useState } from 'react';

const ALL_COUNTRIES_SENTINEL = "ALL_COUNTRIES_SENTINEL_VALUE";
const ALL_STATES_SENTINEL = "ALL_STATES_SENTINEL_VALUE";
const ALL_STATUSES_SENTINEL = "ALL_STATUSES_SENTINEL_VALUE";

interface SurgeonListControlsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: {
    country: string;
    state: string;
    contactStatus: string;
    minRating: string;
    maxPrice: string;
    isFavorite: boolean | '';
  };
  onFilterChange: (filterName: keyof SurgeonListControlsProps['filters'], value: string | boolean) => void;
  sortOption: string;
  onSortChange: (option: string) => void;
  onClearFilters: () => void;
  isLoading?: boolean; // Added isLoading prop
}

export function SurgeonListControls({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  sortOption,
  onSortChange,
  onClearFilters,
  isLoading, // Destructured isLoading
}: SurgeonListControlsProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleClearFiltersAndSearch = () => {
    onClearFilters(); 
  };

  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'isFavorite') {
      if (value === true) {
        return count + 1;
      }
    } else if (value !== '' && value !== ALL_COUNTRIES_SENTINEL && value !== ALL_STATES_SENTINEL && value !== ALL_STATUSES_SENTINEL) {
      return count + 1;
    }
    return count;
  }, 0);

  return (
    <div className="mb-6 p-4 bg-card rounded-lg shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-grow md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, clinic, specialty..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            disabled={isLoading} // Disable input when loading
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={sortOption} onValueChange={onSortChange} disabled={isLoading}> {/* Disable select when loading */}
            <SelectTrigger className="w-full xs:w-auto md:w-[180px]">
 <ListFilter className="h-4 w-4" />
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
 {SORT_OPTIONS.map(option => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-1 w-full xs:w-auto" disabled={isLoading}> {/* Disable button when loading */}
            <Filter className="h-4 w-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
          {(activeFilterCount > 0 || showFilters) && (
            <Button variant="ghost" size="icon" onClick={handleClearFiltersAndSearch} title="Clear search and filters" className="w-full xs:w-auto xs:h-10 xs:w-10" disabled={isLoading}> {/* Disable button when loading */}
              <X className="h-4 w-4" />
              <span className="ml-2">Clear All</span>
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <fieldset disabled={isLoading} className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 border-t pt-4"> {/* Disable fieldset when loading */}
          <Select
 className="mb-3" // Add margin bottom
            value={filters.country} 
            onValueChange={(value) => onFilterChange('country', value === ALL_COUNTRIES_SENTINEL ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_COUNTRIES_SENTINEL}>All Countries</SelectItem>
              {COUNTRIES.map(country => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filters.country === 'US' && (
            <Select 
 className="mb-3" // Add margin bottom
              value={filters.state} 
              onValueChange={(value) => onFilterChange('state', value === ALL_STATES_SENTINEL ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by State (US)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATES_SENTINEL}>All States</SelectItem>
                {USA_STATES.map(state => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select 
 className="mb-3" // Add margin bottom
            value={filters.contactStatus} 
            onValueChange={(value) => onFilterChange('contactStatus', value === ALL_STATUSES_SENTINEL ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES_SENTINEL}>All Statuses</SelectItem>
              {CONTACT_STATUS_OPTIONS.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
 className="mb-3" // Add margin bottom
            type="number"
            placeholder="Min Rating (1-5)"
            value={filters.minRating}
            onChange={(e) => onFilterChange('minRating', e.target.value)}
            min="1"
            max="5"
            step="0.1"
          />
          
           <Button 
              variant={filters.isFavorite ? "default" : "outline"} 
 className="mb-3" // Add margin bottom
              onClick={() => onFilterChange('isFavorite', !filters.isFavorite)}
              className="gap-2"
            >
              <Star className={`h-4 w-4 ${filters.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
              {filters.isFavorite ? "Show All (Clear Fav)" : "Show Favorites Only"}
            </Button>

        </fieldset>
      )}
    </div>
  );
}
