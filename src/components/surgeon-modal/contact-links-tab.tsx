// src/components/surgeon-modal/contact-links-tab.tsx
"use client";

import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import type { Surgeon } from '@/types/surgeon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSurgeons } from '@/contexts/surgeons-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ContactLinksTabProps {
  surgeon: Surgeon;
}

export function ContactLinksTab({ surgeon }: ContactLinksTabProps) {
  const { updateSurgeon } = useSurgeons();
  const { toast } = useToast();
  
  const [contactInfo, setContactInfo] = useState(surgeon.contactInfo || {});
  const [socialMedia, setSocialMedia] = useState(surgeon.socialMedia || {});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setContactInfo(surgeon.contactInfo || {});
    setSocialMedia(surgeon.socialMedia || {});
  }, [surgeon]);

  const handleContactChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialMedia(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updatedSurgeon = {
      ...surgeon,
      contactInfo,
      socialMedia,
    };
    await updateSurgeon(updatedSurgeon);
    toast({ title: "Contact Info Updated", description: `${surgeon.name}'s contact details have been updated.` });
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" value={contactInfo.email || ''} onChange={handleContactChange} />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" type="tel" value={contactInfo.phone || ''} onChange={handleContactChange} />
          </div>
          <div>
            <Label htmlFor="website">Website URL</Label>
            <Input id="website" name="website" type="url" value={contactInfo.website || ''} onChange={handleContactChange} placeholder="https://example.com" />
          </div>
          <div>
            <Label htmlFor="consultLink">Free Consult Link</Label>
            <Input id="consultLink" name="consultLink" type="url" value={contactInfo.consultLink || ''} onChange={handleContactChange} placeholder="https://example.com/consult" />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Social Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="instagram">Instagram URL</Label>
            <Input id="instagram" name="instagram" type="url" value={socialMedia.instagram || ''} onChange={handleSocialChange} placeholder="https://instagram.com/username" />
          </div>
          <div>
            <Label htmlFor="facebook">Facebook URL</Label>
            <Input id="facebook" name="facebook" type="url" value={socialMedia.facebook || ''} onChange={handleSocialChange} placeholder="https://facebook.com/page" />
          </div>
          <div>
            <Label htmlFor="youtube">YouTube URL</Label>
            <Input id="youtube" name="youtube" type="url" value={socialMedia.youtube || ''} onChange={handleSocialChange} placeholder="https://youtube.com/channel" />
          </div>
          <div>
            <Label htmlFor="twitter">X (Twitter) URL</Label>
            <Input id="twitter" name="twitter" type="url" value={socialMedia.twitter || ''} onChange={handleSocialChange} placeholder="https://x.com/username" />
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSaving}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Contact & Links'}
        </Button>
      </div>
    </form>
  );
}
