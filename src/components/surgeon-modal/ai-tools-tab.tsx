
// src/components/surgeon-modal/ai-tools-tab.tsx
"use client";

import type { Surgeon } from '@/types/surgeon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { summarizeNotes } from '@/ai/flows/summarize-notes';
import { draftOutreachEmail } from '@/ai/flows/draft-outreach-email';
import { analyzeSurgeon } from '@/ai/flows/analyze-surgeon';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/user-context';
import { ErrorHandler, ErrorType } from '@/lib/error-handling';
import { SUMMARY_LENGTH_OPTIONS } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Coins } from 'lucide-react';
import { ToastAction } from '@/components/ui/toast';

interface AiToolsTabProps {
  surgeon: Surgeon;
}

export function AiToolsTab({ surgeon }: AiToolsTabProps) {
  const { toast } = useToast();
  const { checkAndUseAICredits, hasEnoughCredits, userData } = useUser();
  const [notesSummary, setNotesSummary] = useState('');
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const [outreachEmail, setOutreachEmail] = useState('');
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);

  const [surgeonAnalysis, setSurgeonAnalysis] = useState<{ suitabilityAnalysis: string; suggestedNextSteps: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSummarizeNotes = async () => {
    if (!surgeon.notes || surgeon.notes.trim() === "") {
      toast({
        title: "No Notes",
        description: "There are no notes to summarize for this surgeon.",
        variant: "destructive",
      });
      return;
    }



    setIsSummarizing(true);
    setNotesSummary('');
    try {
      const result = await summarizeNotes({ notes: surgeon.notes, length: summaryLength });
      setNotesSummary(result.summary);
      toast({
        title: "Notes Summarized",
        description: `Generated a ${summaryLength} summary.`
      });
    } catch (error) {
      const appError = ErrorHandler.handleError(error, false);
      toast({
        title: "Summarization Failed",
        description: appError.message,
        variant: "destructive",
        action: appError.retryable ? (
          <ToastAction altText="Retry" onClick={() => handleSummarizeNotes()}>
            Retry
          </ToastAction>
        ) : undefined
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDraftOutreachEmail = async () => {
    // Check and use credits before proceeding
    const hasCredits = await checkAndUseAICredits('draftEmail');
    if (!hasCredits) {
      return; // Error already shown by checkAndUseAICredits
    }

    setIsDraftingEmail(true);
    setOutreachEmail('');
    try {
      // Assuming a generic user name for now, this could be dynamic
      const userName = "Valued User";
      const result = await draftOutreachEmail({
        surgeonName: surgeon.name,
        clinicName: surgeon.clinicName,
        surgeonSpecialties: surgeon.specialties.join(', '),
        userNotes: surgeon.notes || '', // Pass empty string if no notes
        userName: userName,
      });
      setOutreachEmail(result.emailDraft);
      toast({
        title: "Email Drafted",
        description: "An outreach email has been generated."
      });
    } catch (error) {
      const appError = ErrorHandler.handleError(error, false);
      toast({
        title: "Email Draft Failed",
        description: appError.message,
        variant: "destructive",
        action: appError.retryable ? (
          <ToastAction altText="Retry" onClick={() => handleDraftOutreachEmail()}>
            Retry
          </ToastAction>
        ) : undefined
      });
    } finally {
      setIsDraftingEmail(false);
    }
  };

  const handleAnalyzeSurgeon = async () => {
    // Check and use credits before proceeding
    const hasCredits = await checkAndUseAICredits('analyzeSurgeon');
    if (!hasCredits) {
      return; // Error already shown by checkAndUseAICredits
    }

    setIsAnalyzing(true);
    setSurgeonAnalysis(null);

    // Construct public and private data strings
    const surgeonPublicInfo = `
      Name: ${surgeon.name}
      Clinic: ${surgeon.clinicName}
      Location: ${surgeon.location.city}, ${surgeon.location.state ? surgeon.location.state + ', ' : ''}${surgeon.location.country}
      Specialties: ${surgeon.specialties.join(', ')}
      Public Reviews: ${surgeon.publicReviews.map(r => `${r.source}: ${r.rating} (${r.count || 'N/A'} reviews)`).join('; ') || 'N/A'}
    `.trim();

    const userPrivateTrackingData = `
      Contact Status: ${surgeon.contactStatus}
      Outreach Date: ${surgeon.outreachDate ? new Date(surgeon.outreachDate).toLocaleDateString() : 'N/A'}
      Response Date: ${surgeon.responseDate ? new Date(surgeon.responseDate).toLocaleDateString() : 'N/A'}
      Personal Rating: ${surgeon.personalRating ? surgeon.personalRating + '/5' : 'N/A'}
      Cost Estimate: ${surgeon.costEstimate || 'N/A'}
      Actual Cost: ${surgeon.actualCost || 'N/A'}
      Price Given: ${surgeon.isPriceGiven ? 'Yes' : 'No'}
      Consult Done: ${surgeon.isConsultDone ? 'Yes' : 'No'}
      User Notes: ${surgeon.notes || 'No notes provided.'}
    `.trim();

    try {
      const result = await analyzeSurgeon({
        surgeonPublicInfo,
        userPrivateTrackingData,
      });
      setSurgeonAnalysis(result);
      toast({
        title: "Analysis Complete",
        description: "Surgeon suitability analysis generated."
      });
    } catch (error) {
      const appError = ErrorHandler.handleError(error, false);
      toast({
        title: "Analysis Failed",
        description: appError.message,
        variant: "destructive",
        action: appError.retryable ? (
          <ToastAction altText="Retry" onClick={() => handleAnalyzeSurgeon()}>
            Retry
          </ToastAction>
        ) : undefined
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Credit Balance Display */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-600" />
          <span className="font-medium">Credits: {userData?.credits || 0}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Costs: Email (2) • Analysis (3)
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Summarize Notes
          </CardTitle>
          <CardDescription>
            Condense your notes for this surgeon into a short, medium, or long summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <Label htmlFor="summaryLength">Summary Length</Label>
              <Select value={summaryLength} onValueChange={(val) => setSummaryLength(val as 'short' | 'medium' | 'long')}>
                <SelectTrigger id="summaryLength">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  {SUMMARY_LENGTH_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSummarizeNotes}
              disabled={isSummarizing || !surgeon.notes || surgeon.notes.trim() === ""}
            >
              {isSummarizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Summarize
            </Button>
          </div>
          {notesSummary && (
            <Textarea value={notesSummary} readOnly rows={6} placeholder="Summary will appear here..." />
          )}
          {!surgeon.notes && <p className="text-sm text-muted-foreground">No notes available to summarize for {surgeon.name}.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Draft Outreach Email
            <Badge variant="secondary" className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              2 credits
            </Badge>
          </CardTitle>
          <CardDescription>
            Generate a polite, professional email to inquire about a consultation and pricing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleDraftOutreachEmail}
            disabled={isDraftingEmail || !hasEnoughCredits('draftEmail')}
            variant={hasEnoughCredits('draftEmail') ? "default" : "secondary"}
            className="w-full"
          >
            {isDraftingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Draft Email
          </Button>
          {outreachEmail && (
            <Textarea value={outreachEmail} readOnly rows={10} placeholder="Email draft will appear here..." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Analyze Surgeon Suitability
            <Badge variant="secondary" className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              3 credits
            </Badge>
          </CardTitle>
          <CardDescription>
            Get an AI-powered analysis of this surgeon based on all available data (public info & your private tracking).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleAnalyzeSurgeon}
            disabled={isAnalyzing || !hasEnoughCredits('analyzeSurgeon')}
            variant={hasEnoughCredits('analyzeSurgeon') ? "default" : "secondary"}
            className="w-full"
          >
            {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analyze Surgeon
          </Button>
          {surgeonAnalysis && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Suitability Analysis:</h4>
                <Textarea value={surgeonAnalysis.suitabilityAnalysis} readOnly rows={6} />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Suggested Next Steps:</h4>
                <Textarea value={surgeonAnalysis.suggestedNextSteps} readOnly rows={4} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    