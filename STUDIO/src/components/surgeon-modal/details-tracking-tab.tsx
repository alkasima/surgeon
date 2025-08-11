// src/components/surgeon-modal/details-tracking-tab.tsx
"use client";

import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import type { Surgeon, Location } from '@/types/surgeon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CONTACT_STATUS_OPTIONS, RATING_OPTIONS, COUNTRIES, USA_STATES } from '@/lib/constants';
import { useSurgeons } from '@/contexts/surgeons-context';
import { useToast } from '@/hooks/use-toast';
import { ContactStatus } from '@/types/surgeon';
import { Loader2, Star } from 'lucide-react';

const NO_RATING_VALUE = "clear_rating_sentinel";

interface DetailsTrackingTabProps {
  surgeon: Surgeon;
}

export function DetailsTrackingTab({ surgeon }: DetailsTrackingTabProps) {
  const { updateSurgeon, toggleFavoriteSurgeon } = useSurgeons();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Surgeon>(surgeon);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    // When the surgeon prop updates (e.g., after a favorite toggle from context),
    // reflect that change in the local form data.
    setFormData(surgeon);
  }, [surgeon]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Surgeon, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLocationChange = (field: keyof Location, value: string | null) => {
    setFormData(prev => {
        const newLocation = {
            ...prev.location,
            [field]: value,
        };
        // If country is changed away from US, clear the state.
        if (field === 'country' && value !== 'US') {
            newLocation.state = undefined;
        }
        return {
            ...prev,
            location: newLocation,
        };
    });
  };

  const handleCheckboxChange = (name: keyof Surgeon, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFavoriteToggle = async () => {
    setIsTogglingFavorite(true);
    await toggleFavoriteSurgeon(surgeon.id);
    // The useEffect above will update formData based on the prop change from context.
    setIsTogglingFavorite(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    let updatedStatus = formData.contactStatus;

    // If outreach date is entered and status is None, set to Contacted
    if (formData.outreachDate && updatedStatus === ContactStatus.None) {
        updatedStatus = ContactStatus.Contacted;
    }
    if (formData.isConsultDone) {
        if (formData.contactStatus === ContactStatus.PriceGiven ||
            formData.contactStatus === ContactStatus.Responded ||
            formData.contactStatus === ContactStatus.Contacted ||
            formData.contactStatus === ContactStatus.None) {
            updatedStatus = ContactStatus.ConsultDone;
        }
    } else if (formData.isPriceGiven) { 
        if (formData.contactStatus === ContactStatus.Responded ||
            formData.contactStatus === ContactStatus.Contacted ||
            formData.contactStatus === ContactStatus.None) {
            updatedStatus = ContactStatus.PriceGiven;
        }
    }

    const dataToUpdate: Surgeon = {
      ...formData,
      isFavorite: surgeon.isFavorite, // Ensure we use the latest favorite status from the prop
      contactStatus: updatedStatus,
      personalRating: formData.personalRating ? Number(formData.personalRating) : undefined,
      // Ensure dates are correctly formatted if they are strings
      outreachDate: formData.outreachDate ? new Date(formData.outreachDate).toISOString().split('T')[0] : undefined,
      responseDate: formData.responseDate ? new Date(formData.responseDate).toISOString().split('T')[0] : undefined,
    };
    
    await updateSurgeon(dataToUpdate);
    toast({ title: "Details Updated", description: `${surgeon.name}'s information has been saved to Firestore.` });
    setIsSaving(false);
  };

  // Format date for input type="date"
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      return ''; // Handle invalid date string
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Details & Tracking</h3>
        <Button variant="ghost" size="icon" onClick={handleFavoriteToggle} type="button" title={surgeon.isFavorite ? "Remove from favorites" : "Add to favorites"} disabled={isTogglingFavorite}>
          {isTogglingFavorite ? <Loader2 className="h-5 w-5 animate-spin" /> : <Star className={`h-6 w-6 ${surgeon.isFavorite ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'}`} />}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="contactStatus">Contact Status</Label>
          <Select
            name="contactStatus"
            value={formData.contactStatus}
            onValueChange={(value) => handleSelectChange('contactStatus', value as ContactStatus)}
          >
            <SelectTrigger id="contactStatus"><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              {CONTACT_STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="personalRating">Personal Rating (1-5)</Label>
           <Select
            name="personalRating"
            value={formData.personalRating?.toString() || ""}
            onValueChange={(value) => {
              if (value === NO_RATING_VALUE || value === "") {
                handleSelectChange('personalRating', undefined);
              } else {
                handleSelectChange('personalRating', parseInt(value));
              }
            }}
          >
            <SelectTrigger id="personalRating"><SelectValue placeholder="Rate this surgeon" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_RATING_VALUE}>No Rating</SelectItem>
              {RATING_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="outreachDate">Outreach Date</Label>
          <Input
            id="outreachDate"
            name="outreachDate"
            type="date"
            value={formatDateForInput(formData.outreachDate)}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="responseDate">Response Date</Label>
          <Input
            id="responseDate"
            name="responseDate"
            type="date"
            value={formatDateForInput(formData.responseDate)}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="costEstimate">Cost Estimate (e.g., $5000-7000)</Label>
          <Input id="costEstimate" name="costEstimate" value={formData.costEstimate || ''} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="actualCost">Actual Cost (if known)</Label>
          <Input id="actualCost" name="actualCost" value={formData.actualCost || ''} onChange={handleChange} />
        </div>

        {/* Location Fields */}
        <div className="md:col-span-2">
            <h4 className="text-md font-semibold mt-4 mb-2 border-b pb-1">Location</h4>
        </div>

        <div>
            <Label htmlFor="country">Country</Label>
            <Select
                name="country"
                value={formData.location?.country || ''}
                onValueChange={(value) => handleLocationChange('country', value)}
            >
                <SelectTrigger id="country"><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                {COUNTRIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
        
        <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" value={formData.location?.city || ''} onChange={(e) => handleLocationChange('city', e.target.value)} />
        </div>

        {formData.location?.country === 'US' && (
            <div>
                <Label htmlFor="state">State (US)</Label>
                <Select
                    name="state"
                    value={formData.location.state || ''}
                    onValueChange={(value) => handleLocationChange('state', value)}
                >
                    <SelectTrigger id="state"><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                    {USA_STATES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
        )}
      </div>

      <div className="space-y-2 pt-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="isPriceGiven" checked={!!formData.isPriceGiven} onCheckedChange={(checked) => handleCheckboxChange('isPriceGiven', Boolean(checked))} />
          <Label htmlFor="isPriceGiven" className="font-normal">Price Given</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="isConsultDone" checked={!!formData.isConsultDone} onCheckedChange={(checked) => handleCheckboxChange('isConsultDone', Boolean(checked))} />
          <Label htmlFor="isConsultDone" className="font-normal">Consult Done</Label>
        </div>
         <p className="text-xs text-muted-foreground">
            Note: Checking &quot;Price Given&quot; or &quot;Consult Done&quot; may automatically upgrade the overall contact status if it&apos;s currently at an earlier stage.
          </p>
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows={5} placeholder="Log your interactions, thoughts, pros/cons..." />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving || isTogglingFavorite}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
