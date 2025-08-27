
// src/app/add-surgeon/page.tsx
"use client";

import { useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { ModernLayout } from '@/components/layout/modern-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SurgeonsProvider, useSurgeons } from '@/contexts/surgeons-context';
import { useToast } from '@/hooks/use-toast';
import { COUNTRIES, USA_STATES } from '@/lib/constants';
import type { NewSurgeonData } from '@/types/surgeon';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const addSurgeonFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  clinicName: z.string().min(1, { message: "Clinic name is required." }),
  location: z.object({
    country: z.string().min(1, { message: "Country is required." }),
    state: z.string().nullable().optional(), // Nullable and optional
    city: z.string().min(1, { message: "City is required." }),
  }),
  specialties: z.string().optional(),
  profileImageUrl: z.string().url({ message: "Must be a valid URL." }).optional(),
  contactInfo: z.object({
    email: z.string().email({ message: "Must be a valid email." }).optional(),
    phone: z.string().optional(),
    website: z.string().url({ message: "Must be a valid URL." }).optional(),
    consultLink: z.string().url({ message: "Must be a valid URL." }).optional(),
  }).optional(),
  socialMedia: z.object({
    instagram: z.string().url({ message: "Must be a valid URL." }).optional(),
    facebook: z.string().url({ message: "Must be a valid URL." }).optional(),
    youtube: z.string().url({ message: "Must be a valid URL." }).optional(),
    twitter: z.string().url({ message: "Must be a valid URL." }).optional(),
  }).optional(),
  estimatedRatePerFollicle: z.string().optional(),
  yearsInIndustry: z.string().optional(),
  certifications: z.string().optional(),
  reviewRating: z.string().optional().refine(val => val === undefined || val === "" || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 5), {
    message: "Review rating must be a number between 0 and 5.",
  }),
  reviewCount: z.string().optional().refine(val => val === undefined || val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: "Review count must be a non-negative number.",
  }),
  reviewSource: z.string().optional(),
  isFavorite: z.boolean().optional(),
  outreachDate: z.string().optional().refine(val => val === undefined || val === "" || !isNaN(Date.parse(val)), { message: "Invalid date format for Outreach Date." }),
  responseDate: z.string().optional().refine(val => val === undefined || val === "" || !isNaN(Date.parse(val)), { message: "Invalid date format for Response Date." }),
}).refine(data => {
  if (data.location.country === "US" && (!data.location.state || data.location.state.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "State is required when country is US.",
  path: ["location.state"],
});

type AddSurgeonFormValues = z.infer<typeof addSurgeonFormSchema>;

const headerMap: Record<string, string> = {
  'name': 'name', 'surgeon name': 'name', 'doctor name': 'name', 'name (surgeon/clinic)': 'name', 'surgeon/clinic': 'name', 'surgeon': 'name', 'first name': 'name', 'last name': 'name', 'full name': 'name', 'contact name': 'name', 'primary contact': 'name', 'doctor': 'name',
  'clinic': 'clinicName', 'clinic name': 'clinicName', 'hospital name': 'clinicName', 'clinic/hospital': 'clinicName', 'practice name': 'clinicName', 'office name': 'clinicName', 'center name': 'clinicName', 'organisation': 'clinicName', 'organization': 'clinicName', 'hospital': 'clinicName', 'practice': 'clinicName',
  'country': 'location.country', 'nation': 'location.country', 'location country': 'location.country', 'country code': 'location.country',
  'city': 'location.city', 'town': 'location.city', 'location city': 'location.city', 'municipality': 'location.city',
  'state': 'location.state', 'province': 'location.state', 'location state': 'location.state', 'state/province': 'location.state', 'region': 'location.state',
  'address': 'location.addressLine', 'street address': 'location.addressLine', 'full address': 'location.addressLine', // addressLine is not directly in schema, but good to have
  'email': 'contactInfo.email', 'e-mail': 'contactInfo.email', 'email address': 'contactInfo.email', 'contact email': 'contactInfo.email',
  'phone': 'contactInfo.phone', 'phone number': 'contactInfo.phone', 'contact number': 'contactInfo.phone', 'telephone': 'contactInfo.phone',
  'website': 'contactInfo.website', 'web site': 'contactInfo.website', 'url': 'contactInfo.website', 'clinic website': 'contactInfo.website', 'web': 'contactInfo.website', 'site': 'contactInfo.website',
  'consult link': 'contactInfo.consultLink', 'consultation link': 'contactInfo.consultLink', 'free consult link': 'contactInfo.consultLink', 'booking link': 'contactInfo.consultLink', 'schedule consult': 'contactInfo.consultLink', 'consultation url': 'contactInfo.consultLink',
  'specialties': 'specialties', 'specialty': 'specialties', 'areas of expertise': 'specialties', 'procedures': 'specialties', 'focus': 'specialties', 'services': 'specialties',
  'estimated rate': 'estimatedRatePerFollicle', 'rate per follicle': 'estimatedRatePerFollicle', 'price per graft': 'estimatedRatePerFollicle', 'estimated rate per follicle': 'estimatedRatePerFollicle', 'cost': 'estimatedRatePerFollicle', 'price': 'estimatedRatePerFollicle', 'rate': 'estimatedRatePerFollicle', 'graft price': 'estimatedRatePerFollicle', 'follicle price': 'estimatedRatePerFollicle', 'est rate': 'estimatedRatePerFollicle',
  'years in industry': 'yearsInIndustry', 'experience': 'yearsInIndustry', 'years of experience': 'yearsInIndustry', 'industry experience': 'yearsInIndustry',
  'certifications': 'certifications', 'credentials': 'certifications', 'board certifications': 'certifications', 'qualifications': 'certifications', 'accreditations': 'certifications',
  'reviewrating': 'reviewRating', 'rating': 'reviewRating', 'public rating': 'reviewRating', 'average rating': 'reviewRating', 'score': 'reviewRating', 'avg score': 'reviewRating', 'average score': 'reviewRating', 'overall rating': 'reviewRating',
  'review count': 'reviewCount', 'reviewcount': 'reviewCount', 'number of reviews': 'reviewCount', 'reviews': 'reviewCount', 'total reviews': 'reviewCount', 'num reviews': 'reviewCount',
  'reviewsource': 'reviewSource', 'review source': 'reviewSource', 'source of reviews': 'reviewSource', 'platform': 'reviewSource', 'review platform': 'reviewSource',
  'instagram': 'socialMedia.instagram', 'ig': 'socialMedia.instagram', 'insta': 'socialMedia.instagram',
  'facebook': 'socialMedia.facebook', 'fb': 'socialMedia.facebook',
  'youtube': 'socialMedia.youtube', 'yt': 'socialMedia.youtube',
  'twitter': 'socialMedia.twitter', 'x': 'socialMedia.twitter', 'x (twitter)': 'socialMedia.twitter',
  'linkedin': 'socialMedia.linkedin', 'li': 'socialMedia.linkedin',
  'profileimageurl': 'profileImageUrl', 'profile image url': 'profileImageUrl', 'image url': 'profileImageUrl', 'photo url': 'profileImageUrl', 'picture url': 'profileImageUrl', 'avatar url': 'profileImageUrl', 'profile pic': 'profileImageUrl',
  'isfavorite': 'isFavorite', 'favorite': 'isFavorite', 'starred': 'isFavorite',
  'outreachdate': 'outreachDate', 'outreach date': 'outreachDate', 'contacted date': 'outreachDate', 'first contacted': 'outreachDate', 'date contacted': 'outreachDate',
  'responsedate': 'responseDate', 'response date': 'responseDate', 'last response': 'responseDate', 'date responded': 'responseDate',
};

function AddSurgeonFormContent() {
  const router = useRouter();
  const { addSurgeon, importSurgeonsBatch } = useSurgeons();
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [importAttemptDetails, setImportAttemptDetails] = useState<string[] | null>(null);


  const form = useForm<AddSurgeonFormValues>({
    resolver: zodResolver(addSurgeonFormSchema),
    defaultValues: {
      name: "",
      clinicName: "",
      location: { country: "", state: "", city: "" },
      specialties: "",
      profileImageUrl: "",
      contactInfo: { email: "", phone: "", website: "", consultLink: "" },
      socialMedia: { instagram: "", facebook: "", youtube: "", twitter: "" },
      estimatedRatePerFollicle: "",
      yearsInIndustry: "",
      certifications: "",
      reviewRating: "",
      reviewCount: "",
      reviewSource: "",
      isFavorite: false,
      outreachDate: "",
      responseDate: "",
    },
  });

  const watchedCountry = form.watch("location.country");

  async function onSubmit(data: AddSurgeonFormValues) {
    setIsSubmittingManual(true);
    setImportAttemptDetails(null); 
    const newSurgeonData: NewSurgeonData = {
        ...data,
        location: {
          ...data.location,
          state: data.location.country === 'US' ? data.location.state : null,
        }
    };
    const wasAdded = await addSurgeon(newSurgeonData);
    if (wasAdded) {
      toast({
        title: "Surgeon Added",
        description: `${data.name} has been successfully added.`,
      });
      router.push('/');
    } else {
      toast({
        title: "Duplicate Surgeon or Error",
        description: "A surgeon with this name, clinic, city, and country may already exist, or an error occurred.",
        variant: "destructive",
      });
    }
    setIsSubmittingManual(false);
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCsvFile(event.target.files[0]);
    } else {
      setCsvFile(null);
    }
    setImportAttemptDetails(null); 
  };

  const handleProcessCsv = async () => {
    if (!csvFile) {
      toast({ title: "No file selected", description: "Please select a CSV file to upload.", variant: "destructive" });
      return;
    }
    setIsProcessingCsv(true);
    setImportAttemptDetails(null);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast({ title: "Error reading file", description: "Could not read the CSV file content.", variant: "destructive" });
        setIsProcessingCsv(false);
        return;
      }

      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        toast({ title: "Invalid CSV", description: "CSV file must contain a header row and at least one data row.", variant: "destructive" });
        setIsProcessingCsv(false);
        return;
      }

      const rawHeaders = lines[0].split(',').map(h => h.trim().toLowerCase());
      const dataRows = lines.slice(1);
      
      const surgeonsToImport: NewSurgeonData[] = [];
      const localParseErrors: string[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const rowNumber = i + 2; 
        const row = dataRows[i];
        const values = row.split(',').map(v => v.trim()); 
        const surgeonCsvData: Record<string, any> = { location: {}, contactInfo: {}, socialMedia: {} };

        rawHeaders.forEach((rawHeader, index) => {
          const mappedKey = headerMap[rawHeader];
          if (mappedKey && values[index] !== undefined && values[index] !== null) {
            let value = values[index].trim();
            // Simple unquoting: if value starts and ends with quote, remove them.
            if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
              value = value.substring(1, value.length - 1).trim();
            }
            value = value.trim(); // Trim again after potential unquoting
            
            const lowerCleanedValue = value.toLowerCase();
            const isEffectivelyEmptyOrNA = value === '' || lowerCleanedValue === 'n/a' || lowerCleanedValue === 'missing';
            
            const assignNested = (obj: any, keys: string[], val: any) => {
              let current = obj;
              keys.forEach((key, idx) => {
                if (idx === keys.length - 1) {
                  current[key] = val;
                } else {
                  current[key] = current[key] || {};
                  current = current[key];
                }
              });
            };
            
            const fieldPath = mappedKey.split('.');
            const isUrlField = ['contactInfo.website', 'contactInfo.consultLink', 'profileImageUrl', 
                                'socialMedia.instagram', 'socialMedia.facebook', 'socialMedia.youtube', 'socialMedia.twitter'].includes(mappedKey);
            const isEmailField = mappedKey === 'contactInfo.email';

            if (isEffectivelyEmptyOrNA) {
              // Treat as undefined by not assigning; Zod .optional() will handle it
            } else if (isEmailField) {
              if (value === '' || !z.string().email().safeParse(value).success) {
                // Malformed or empty email, field remains undefined in surgeonCsvData
              } else {
                assignNested(surgeonCsvData, fieldPath, value);
              }
            } else if (isUrlField) {
              if (value === '' || !z.string().url().safeParse(value).success) {
                // Malformed or empty URL, field remains undefined in surgeonCsvData
              } else {
                assignNested(surgeonCsvData, fieldPath, value);
              }
            } else if (mappedKey === 'isFavorite') {
              assignNested(surgeonCsvData, fieldPath, lowerCleanedValue === 'true');
            } else {
              assignNested(surgeonCsvData, fieldPath, value); // Assign non-empty, non-URL/email values
            }
          }
        });
        
        const missingFields: string[] = [];
        if (!surgeonCsvData.name) missingFields.push("Name");
        if (!surgeonCsvData.clinicName) missingFields.push("Clinic Name");
        if (!surgeonCsvData.location?.country) missingFields.push("Country");
        if (!surgeonCsvData.location?.city) missingFields.push("City");

        if (missingFields.length > 0) {
           localParseErrors.push(`Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')}. Name: '${surgeonCsvData.name || "MISSING"}', Clinic Name: '${surgeonCsvData.clinicName || "MISSING"}', Country: '${surgeonCsvData.location?.country || "MISSING"}', City: '${surgeonCsvData.location?.city || "MISSING"}'. Check CSV headers and values.`);
          continue;
        }
        if (surgeonCsvData.location.country === 'US' && (!surgeonCsvData.location.state || surgeonCsvData.location.state.trim() === '')) {
            localParseErrors.push(`Row ${rowNumber} (Name: ${surgeonCsvData.name}): State is required for US based surgeons.`);
            continue;
        }

        try {
           const candidateData: NewSurgeonData = {
            name: surgeonCsvData.name,
            clinicName: surgeonCsvData.clinicName,
            location: {
              country: surgeonCsvData.location.country,
              city: surgeonCsvData.location.city,
              state: surgeonCsvData.location.state, // Will be undefined if not set
            },
            specialties: surgeonCsvData.specialties,
            profileImageUrl: surgeonCsvData.profileImageUrl, // Undefined if not set or invalid
            contactInfo: {
              email: surgeonCsvData.contactInfo?.email, // Undefined if not set or invalid
              phone: surgeonCsvData.contactInfo?.phone,
              website: surgeonCsvData.contactInfo?.website, // Undefined if not set or invalid
              consultLink: surgeonCsvData.contactInfo?.consultLink, // Undefined if not set or invalid
            },
            socialMedia: {
              instagram: surgeonCsvData.socialMedia?.instagram, // Undefined if not set or invalid
              facebook: surgeonCsvData.socialMedia?.facebook,
              youtube: surgeonCsvData.socialMedia?.youtube,
              twitter: surgeonCsvData.socialMedia?.twitter,
            },
            estimatedRatePerFollicle: surgeonCsvData.estimatedRatePerFollicle,
            yearsInIndustry: surgeonCsvData.yearsInIndustry, 
            certifications: surgeonCsvData.certifications,
            reviewRating: surgeonCsvData.reviewRating,
            reviewCount: surgeonCsvData.reviewCount,
            reviewSource: surgeonCsvData.reviewSource,
            isFavorite: surgeonCsvData.isFavorite === undefined ? false : surgeonCsvData.isFavorite,
            outreachDate: surgeonCsvData.outreachDate,
            responseDate: surgeonCsvData.responseDate,
          };
          addSurgeonFormSchema.parse(candidateData); 
          surgeonsToImport.push(candidateData);
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            localParseErrors.push(`Row ${rowNumber} (Name: ${surgeonCsvData.name || 'N/A'}): Validation failed: ${validationError.errors.map(e => `${e.path.join('.')} - ${e.message}`).join(', ')}`);
          } else {
            localParseErrors.push(`Row ${rowNumber} (Name: ${surgeonCsvData.name || 'N/A'}): Unknown validation error. ${ (validationError as Error).message }`);
          }
        }
      }

      let currentImportDetails: string[] = [...localParseErrors];
      let finalToastTitle = "CSV Import Processed";
      let finalToastDescription = "";
      let finalToastVariant: "default" | "destructive" = "default";


      if (surgeonsToImport.length === 0) {
        finalToastTitle = "CSV Import Failed: No Valid Surgeons";
        finalToastDescription = `No valid surgeon data found in the CSV. ${localParseErrors.length > 0 ? `${localParseErrors.length} row(s) had validation issues.` : ''} See the 'CSV Import Details' section below.`;
        finalToastVariant = "destructive";
        if (localParseErrors.length === 0) { 
          currentImportDetails.push("No surgeon data could be successfully parsed from the CSV for import.");
        }
      } else {
        const { addedCount, skippedDuplicatesCount, errorCount, errors: firestoreImportErrors } = await importSurgeonsBatch(surgeonsToImport);
        
        if (addedCount > 0) currentImportDetails.push(`${addedCount} surgeon(s) successfully added to the database.`);
        if (skippedDuplicatesCount > 0) currentImportDetails.push(`${skippedDuplicatesCount} surgeon(s) were skipped as duplicates by the database.`);
        if (errorCount > 0) currentImportDetails.push(`${errorCount} surgeon(s) encountered an error during database import.`);
        currentImportDetails = currentImportDetails.concat(firestoreImportErrors.map(e => `DB Import: ${e}`)); 

        let summaryParts = [];
        if (addedCount > 0) summaryParts.push(`${addedCount} added`);
        if (localParseErrors.length > 0) summaryParts.push(`${localParseErrors.length} validation issues`);
        if (skippedDuplicatesCount > 0) summaryParts.push(`${skippedDuplicatesCount} DB duplicates`);
        if (errorCount > 0) summaryParts.push(`${errorCount} DB errors`);
        
        if (summaryParts.length === 0 && localParseErrors.length === 0) {
             finalToastDescription = "CSV processed. No new surgeons were added and no issues found. You can review details in the 'CSV Import Details' section below if needed.";
        } else if (summaryParts.length > 0) {
            finalToastDescription = summaryParts.join(', ') + ". See the 'CSV Import Details' section below for specifics.";
        }


        if (localParseErrors.length > 0 || errorCount > 0 || skippedDuplicatesCount > 0) {
          finalToastTitle = "CSV Import: Issues Encountered";
          finalToastVariant = "destructive";
        } else {
          finalToastTitle = "CSV Import Successful";
        }
      }
      
      toast({
        title: finalToastTitle,
        description: finalToastDescription,
        variant: finalToastVariant,
        duration: 10000,
      });
      
      if (currentImportDetails.length > 0) {
        console.error("CSV Import Attempt Details (also shown on page):", currentImportDetails);
      }
      setImportAttemptDetails(currentImportDetails.length > 0 ? currentImportDetails : ["No issues found during import."]);

      setCsvFile(null); 
      const fileInput = document.getElementById('csv-upload-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setIsProcessingCsv(false);
    };

    reader.onerror = () => {
      toast({ title: "File Read Error", description: "There was an error reading the file.", variant: "destructive" });
      setIsProcessingCsv(false);
    };
    
    reader.readAsText(csvFile);
  };


  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="flex items-center gap-3 p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Add New Surgeon</h1>
            <p className="text-sm text-muted-foreground">Enter surgeon details or import from CSV</p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => router.push('/')}
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
            <CardTitle className="text-2xl font-headline">Add New Surgeon</CardTitle>
            <CardDescription>Enter the details for the new surgeon. Data will be saved to your account in Firestore.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Surgeon Name</FormLabel> <FormControl><Input placeholder="e.g., Dr. John Doe" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="clinicName" render={({ field }) => ( <FormItem> <FormLabel>Clinic Name</FormLabel> <FormControl><Input placeholder="e.g., Elite Hair Clinic" {...field} /></FormControl> <FormMessage /> </FormItem> )} />

                <div className="space-y-2">
                  <FormLabel>Location</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="location.country" render={({ field }) => ( <FormItem> <FormLabel className="text-xs">Country</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger></FormControl> <SelectContent> {COUNTRIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                    {watchedCountry === 'US' && ( <FormField control={form.control} name="location.state" render={({ field }) => ( <FormItem> <FormLabel className="text-xs">State (US)</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}> <FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl> <SelectContent> {USA_STATES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} /> )}
                    <FormField control={form.control} name="location.city" render={({ field }) => ( <FormItem> <FormLabel className="text-xs">City</FormLabel> <FormControl><Input placeholder="e.g., Los Angeles" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                </div>
                
                <FormField control={form.control} name="specialties" render={({ field }) => ( <FormItem> <FormLabel>Specialties</FormLabel> <FormControl><Input placeholder="e.g., FUE, FUT, Beard Transplant" {...field} /></FormControl> <FormDescription>Comma-separated values.</FormDescription> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="profileImageUrl" render={({ field }) => ( <FormItem> <FormLabel>Profile Image URL (Optional)</FormLabel> <FormControl><Input type="url" placeholder="https://example.com/image.png" {...field} /></FormControl> <FormMessage /> </FormItem> )} />

                <div className="space-y-2">
                  <FormLabel>Contact Information (Optional)</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="contactInfo.email" render={({ field }) => (<FormItem><FormLabel className="text-xs">Email</FormLabel><FormControl><Input type="email" placeholder="surgeon@example.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="contactInfo.phone" render={({ field }) => (<FormItem><FormLabel className="text-xs">Phone</FormLabel><FormControl><Input placeholder="+1-555-123-4567" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="contactInfo.website" render={({ field }) => (<FormItem><FormLabel className="text-xs">Website URL</FormLabel><FormControl><Input type="url" placeholder="https://clinicwebsite.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="contactInfo.consultLink" render={({ field }) => (<FormItem><FormLabel className="text-xs">Consult Link URL</FormLabel><FormControl><Input type="url" placeholder="https://clinicwebsite.com/consult" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel>Social Media (Optional)</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="socialMedia.instagram" render={({ field }) => (<FormItem><FormLabel className="text-xs">Instagram URL</FormLabel><FormControl><Input type="url" placeholder="https://instagram.com/username" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="socialMedia.facebook" render={({ field }) => (<FormItem><FormLabel className="text-xs">Facebook URL</FormLabel><FormControl><Input type="url" placeholder="https://facebook.com/page" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="socialMedia.youtube" render={({ field }) => (<FormItem><FormLabel className="text-xs">YouTube URL</FormLabel><FormControl><Input type="url" placeholder="https://youtube.com/channel" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="socialMedia.twitter" render={({ field }) => (<FormItem><FormLabel className="text-xs">X (Twitter) URL</FormLabel><FormControl><Input type="url" placeholder="https://x.com/username" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="outreachDate" render={({ field }) => (<FormItem><FormLabel className="text-xs">Outreach Date</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="responseDate" render={({ field }) => (<FormItem><FormLabel className="text-xs">Response Date</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                
                <Button type="submit" className="w-full md:w-auto" disabled={isSubmittingManual || isProcessingCsv}>
                  {isSubmittingManual ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Surgeon... </> ) : ( 'Add Surgeon' )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter> <p className="text-xs text-muted-foreground"> More details like reviews, costs, and tracking notes can be added after creating the surgeon. </p> </CardFooter>
        </Card>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Bulk Add Surgeons via CSV to Firestore</CardTitle>
            <CardDescription>
              <p className="mb-2"> Upload a CSV file with a header row. Data will be batch imported into your Firestore database. The system maps data by looking for specific header names (case-insensitive). Ensure your CSV structure aligns with the recommended headers below. Malformed or empty optional URLs/emails will be skipped. Rows with missing required fields (Name, Clinic, Country, City; State for US) will be skipped and listed in the details below.</p>
              <p className="mb-1"><strong className="font-semibold">CSV Formatting:</strong> For best results, ensure fields containing commas (e.g., "Los Angeles, CA") are enclosed in double quotes. Double quotes within fields should be escaped (e.g., by doubling them: ""Quote inside field""). Cells with "N/A", "MISSING" (case-insensitive) or that are empty for optional fields will be treated as not provided.</p>
              <p className="mb-1"><strong className="font-semibold">Location Data:</strong></p>
              <ul className="list-disc list-inside text-sm space-y-1 mb-2 pl-4">
                <li>All CSV files <strong className="font-semibold">MUST have a 'Country' column</strong> (e.g., "US", "Turkey").</li>
                <li>If 'Country' is "US", a <strong className="font-semibold">'State' column is also REQUIRED</strong> (e.g., "CA", "NY").</li>
                <li>A <strong className="font-semibold">'City' column is always REQUIRED</strong>.</li>
              </ul>
              <p className="mb-2"><strong className="font-semibold">Recommended Header Names (case-insensitive, order can vary, common examples):</strong></p>
              <ol className="list-decimal list-inside text-sm space-y-1 mb-2">
                <li><strong className="font-semibold">Name</strong> (e.g., 'Name', 'Surgeon Name', 'Name (Surgeon/Clinic)')\*</li>
                <li><strong className="font-semibold">Clinic Name</strong> (e.g., 'Clinic Name', 'Clinic')\*</li>
                <li><strong className="font-semibold">Country</strong>\*</li>
                <li><strong className="font-semibold">City</strong>\*</li>
                <li><strong className="font-semibold">State</strong> (Required if Country is "US")</li>
                <li>Other examples: Email, Specialties, 'Estimated Rate', 'Years in Industry', Certifications, 'Consult Link', Rating, 'Review Count', 'Review Source', Instagram, Facebook, YouTube, Twitter, 'Image URL', Phone, Website, Favorite (true/false), 'Outreach Date' (YYYY-MM-DD), 'Response Date' (YYYY-MM-DD).</li>
              </ol>
              <p className="mb-2"> Fields marked with \* are required. Others are optional. The system will attempt to map common header variations. Check the "Import Details" section that appears after processing for specific row feedback. </p>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv-upload-input">CSV File</Label>
              <Input id="csv-upload-input" type="file" accept=".csv" onChange={handleFileChange} className="mt-1" disabled={isProcessingCsv || isSubmittingManual} />
            </div>
            <Button onClick={handleProcessCsv} disabled={!csvFile || isProcessingCsv || isSubmittingManual} className="w-full md:w-auto">
              {isProcessingCsv ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing & Importing... </> ) : ( 'Upload and Import CSV to Firestore' )}
            </Button>
          </CardContent>
           <CardFooter> <p className="text-xs text-muted-foreground"> Review the "CSV Import Details" section (appears after import) for feedback on individual rows. For complex CSVs with unescaped quotes or commas within fields, parsing issues might occur. </p> </CardFooter>
        </Card>

        {importAttemptDetails && importAttemptDetails.length > 0 && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>CSV Import Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4 text-sm">
                {importAttemptDetails.map((detail, index) => {
                  const isError = /error|failed|missing|validation/i.test(detail);
                  const isSkipped = /skipped/i.test(detail);
                  const isSuccess = /added|successfully/i.test(detail);
                  return (
                    <p key={index} className={`mb-1 ${
                      isError ? 'text-destructive' : 
                      isSkipped ? 'text-orange-600 dark:text-orange-400' :
                      isSuccess ? 'text-green-600 dark:text-green-400' : ''
                    }`}>
                      {detail}
                    </p>
                  );
                })}
              </ScrollArea>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

export default function AddSurgeonPage() {
  return (
    <ModernLayout>
      <AddSurgeonFormContent />
    </ModernLayout>
  );
}

