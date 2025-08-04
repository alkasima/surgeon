// src/components/dashboard/surgeon-card.tsx
"use client";

// import Image from 'next/image'; // Removed next/image import
import type { Surgeon } from '@/types/surgeon';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, DollarSign, Edit3 } from 'lucide-react';
import { getStatusColor } from '@/lib/constants';
import { useSurgeons } from '@/contexts/surgeons-context';

interface SurgeonCardProps {
  surgeon: Surgeon;
}

export function SurgeonCard({ surgeon }: SurgeonCardProps) {
  const { openModalWithSurgeon, toggleFavoriteSurgeon } = useSurgeons();

  const statusColorClass = getStatusColor(surgeon.contactStatus);
  const formattedStatus = surgeon.contactStatus.replace(/([A-Z])/g, ' $1').trim();

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when toggling favorite
    toggleFavoriteSurgeon(surgeon.id);
  };

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="p-4">
        <div className="flex items-start gap-4">
          {surgeon.profileImageUrl && (
            <img
              src={surgeon.profileImageUrl}
              alt={surgeon.name}
              width={80}
              height={80}
              className="rounded-lg object-cover w-[80px] h-[80px]" // Added w/h classes for consistency
              data-ai-hint="doctor portrait"
              loading="lazy" // Added lazy loading for standard img
            />
          )}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-headline mb-1">{surgeon.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{surgeon.clinicName}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={handleFavoriteToggle} className="text-muted-foreground hover:text-amber-500 -mr-2 -mt-1">
                <Star className={`h-5 w-5 ${surgeon.isFavorite ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'}`} />
                <span className="sr-only">Toggle Favorite</span>
              </Button>
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {surgeon.location.city}, {surgeon.location.state ? `${surgeon.location.state}, ` : ''}{surgeon.location.country}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-muted-foreground mb-1">Specialties:</h4>
          <div className="flex flex-wrap gap-1">
            {surgeon.specialties.slice(0, 3).map((spec, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">{spec}</Badge>
            ))}
            {surgeon.specialties.length > 3 && <Badge variant="secondary" className="text-xs">+{surgeon.specialties.length - 3} more</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          {surgeon.publicReviews.length > 0 && surgeon.publicReviews[0].rating && typeof surgeon.publicReviews[0].count !== 'undefined' && (
            <div className="flex items-center" title="Public Rating">
              <Star className="h-3.5 w-3.5 mr-1 text-yellow-500" />
              {surgeon.publicReviews[0].rating} ({surgeon.publicReviews[0].count} reviews)
            </div>
          )}
          {surgeon.personalRating && (
             <div className="flex items-center" title="Personal Rating">
              <Star className="h-3.5 w-3.5 mr-1 text-primary" />
              {surgeon.personalRating}/5
            </div>
          )}
          {(surgeon.costEstimate || surgeon.actualCost) && (
            <div className="flex items-center" title="Cost">
              <DollarSign className="h-3.5 w-3.5 mr-1 text-green-600" />
              {surgeon.actualCost || surgeon.costEstimate}
            </div>
          )}
        </div>
        
        <Badge className={`text-xs font-medium ${statusColorClass} border`}>{formattedStatus}</Badge>

      </CardContent>
      <CardFooter className="p-4 bg-muted/30 border-t">
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => openModalWithSurgeon(surgeon)}>
          <Edit3 className="h-4 w-4" />
          View & Edit Details
        </Button>
      </CardFooter>
    </Card>
  );
}
