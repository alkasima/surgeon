
"use client";

import type React from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { SurgeonsProvider, useSurgeons } from '@/contexts/surgeons-context';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { SurgeonListControls } from '@/components/dashboard/surgeon-list-controls';
import { SurgeonList } from '@/components/dashboard/surgeon-list';
import { SurgeonModal } from '@/components/surgeon-modal';
import type { Surgeon, ContactStatus } from '@/types/surgeon';
import { SORT_OPTIONS } from '@/lib/constants';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';


interface DashboardFilters {
  country: string;
  state: string;
  contactStatus: string;
  minRating: string;
  maxPrice: string;
  isFavorite: boolean | ''; 
}

function DashboardContent() {
  const { surgeons, isLoading: surgeonsLoading } = useSurgeons(); // surgeonsLoading from context
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<DashboardFilters>({
    country: '',
    state: '',
    contactStatus: '',
    minRating: '',
    maxPrice: '',
    isFavorite: '', 
  });
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0].value);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = useCallback((filterName: keyof DashboardFilters, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
      ...(filterName === 'country' && value !== 'US' && { state: '' }),
    }));
  }, []);

  const handleSortChange = (option: string) => {
    setSortOption(option);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      country: '',
      state: '',
      contactStatus: '',
      minRating: '',
      maxPrice: '',
      isFavorite: '',
    });
    setSortOption(SORT_OPTIONS[0].value);
  };

  const handleStatCardClick = useCallback((status?: ContactStatus, isFavoriteFilter?: boolean) => {
    setSearchTerm(''); 
    if (isFavoriteFilter !== undefined) { // Check if isFavoriteFilter is explicitly passed
      setFilters({
        country: '', state: '', contactStatus: '', minRating: '', maxPrice: '',
        isFavorite: isFavoriteFilter, // Use the passed boolean value
      });
    } else if (status) {
      setFilters({
        country: '', state: '', minRating: '', maxPrice: '', isFavorite: '',
        contactStatus: status,
      });
    }
  }, []);


  const filteredAndSortedSurgeons = useMemo(() => {
    let filtered = [...surgeons];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(lowerSearchTerm) ||
        s.clinicName.toLowerCase().includes(lowerSearchTerm) ||
        (s.specialties && s.specialties.some(spec => spec.toLowerCase().includes(lowerSearchTerm)))
      );
    }

    if (filters.country) {
      filtered = filtered.filter(s => s.location.country === filters.country);
    }
    if (filters.country === 'US' && filters.state) {
      filtered = filtered.filter(s => s.location.state === filters.state);
    }
    if (filters.contactStatus) {
      filtered = filtered.filter(s => s.contactStatus === filters.contactStatus);
    }
    if (filters.minRating) {
      const minRatingNum = parseFloat(filters.minRating);
      if (!isNaN(minRatingNum)) {
        filtered = filtered.filter(s => {
          const personalRating = s.personalRating || 0;
          const publicRating = s.publicReviews?.[0]?.rating || 0;
          return personalRating >= minRatingNum || publicRating >= minRatingNum;
        });
      }
    }
    if (filters.isFavorite === true) { // Explicitly check for true
      filtered = filtered.filter(s => s.isFavorite === true);
    }
    if (filters.isFavorite === false) { // Explicitly check for false
        // This case would mean "show only non-favorites if a 'show non-favorites' filter was active"
        // For now, if isFavorite is an empty string or false from the filter control perspective, it means "don't filter by favorite"
        // Or, if the favorite filter button means "show only favorites" vs "show all", then `filters.isFavorite: false` means clear this specific filter.
        // The current logic for the favorite button in SurgeonListControls toggles `isFavorite` between `true` and `false`.
        // if `false`, it effectively means "don't apply favorite filter" unless we add specific logic to show "only non-favorites"
    }


    switch (sortOption) {
      case 'favorites_first':
        filtered.sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return a.name.localeCompare(b.name); // Secondary sort by name
        });
        break;
      case 'reviews_high_low':
        filtered.sort((a, b) => (b.publicReviews?.[0]?.count || 0) - (a.publicReviews?.[0]?.count || 0));
        break;
      case 'rating_high_low': 
        filtered.sort((a, b) => {
          const ratingA = a.personalRating || a.publicReviews?.[0]?.rating || 0;
          const ratingB = b.personalRating || b.publicReviews?.[0]?.rating || 0;
          return ratingB - ratingA;
        });
        break;
      case 'cost_low_high':
        filtered.sort((a, b) => {
          const costA = parseFloat(a.actualCost || a.costEstimate?.split('-')[0]?.replace(/[^0-9.]/g, '') || 'Infinity');
          const costB = parseFloat(b.actualCost || b.costEstimate?.split('-')[0]?.replace(/[^0-9.]/g, '') || 'Infinity');
          return costA - costB;
        });
        break;
      case 'cost_high_low':
         filtered.sort((a, b) => {
          const costA = parseFloat(a.actualCost || a.costEstimate?.split('-')[0]?.replace(/[^0-9.]/g, '') || '-Infinity');
          const costB = parseFloat(b.actualCost || b.costEstimate?.split('-')[0]?.replace(/[^0-9.]/g, '') || '-Infinity');
          return costB - costA;
        });
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'country_asc':
        filtered.sort((a, b) => a.location.country.localeCompare(b.location.country));
        break;
      case 'country_desc':
        filtered.sort((a, b) => b.location.country.localeCompare(a.location.country));
        break;
      case 'state_asc': 
        filtered.sort((a, b) => {
          if (a.location.country === 'US' && b.location.country === 'US') {
            return (a.location.state || '').localeCompare(b.location.state || '');
          }
          if (a.location.country === 'US') return -1; 
          if (b.location.country === 'US') return 1;
          return 0;
        });
        break;
      case 'state_desc': 
         filtered.sort((a, b) => {
          if (a.location.country === 'US' && b.location.country === 'US') {
            return (b.location.state || '').localeCompare(a.location.state || '');
          }
          if (a.location.country === 'US') return -1;
          if (b.location.country === 'US') return 1;
          return 0;
        });
        break;
      case 'status_asc':
        filtered.sort((a,b) => (a.contactStatus || '').localeCompare(b.contactStatus || ''));
        break;
      case 'status_desc':
        filtered.sort((a,b) => (b.contactStatus || '').localeCompare(a.contactStatus || ''));
        break;
      default:
        // Default to favorites first, then by name
        filtered.sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
    }
    return filtered;
  }, [surgeons, searchTerm, filters, sortOption]);


  return (
    <MainLayout>
      <div className="space-y-6">
        <StatsOverview onStatCardClick={handleStatCardClick} isLoading={surgeonsLoading} />
        <SurgeonListControls
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          sortOption={sortOption}
          onSortChange={handleSortChange}
          onClearFilters={handleClearFilters}
          isLoading={surgeonsLoading}
        />
        <SurgeonList surgeons={filteredAndSortedSurgeons} isLoading={surgeonsLoading} />
      </div>
      <SurgeonModal />
    </MainLayout>
  );
}

function ProtectedDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <MainLayout> {/* Ensure MainLayout is used here for SidebarProvider context */}
        <div className="flex flex-1 justify-center items-center h-[calc(100vh-theme(spacing.16))]"> {/* Adjust height considering header */}
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }
  return <DashboardContent />;
}


export default function Home() {
  return (
    <SurgeonsProvider>
      <ProtectedDashboard />
    </SurgeonsProvider>
  );
}
