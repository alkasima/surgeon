// src/ai/flows/draft-outreach-email.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for drafting personalized outreach emails to surgeons.
 *
 * - draftOutreachEmail - A function that generates a draft email for reaching out to a surgeon.
 * - DraftOutreachEmailInput - The input type for the draftOutreachEmail function.
 * - DraftOutreachEmailOutput - The return type for the draftOutreachEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftOutreachEmailInputSchema = z.object({
  surgeonName: z.string().describe('The name of the surgeon.'),
  clinicName: z.string().describe('The name of the surgeon\'s clinic.'),
  surgeonSpecialties: z.string().describe('The specialties of the surgeon.'),
  userNotes: z.string().describe('The user\'s notes about the surgeon.'),
  userName: z.string().describe('The name of the user.'),
});
export type DraftOutreachEmailInput = z.infer<typeof DraftOutreachEmailInputSchema>;

const DraftOutreachEmailOutputSchema = z.object({
  emailDraft: z.string().describe('The draft email to send to the surgeon.'),
});
export type DraftOutreachEmailOutput = z.infer<typeof DraftOutreachEmailOutputSchema>;

export async function draftOutreachEmail(input: DraftOutreachEmailInput): Promise<DraftOutreachEmailOutput> {
  console.log('[draftOutreachEmail Flow] Called with input:', { surgeonName: input.surgeonName, userName: input.userName });
  try {
    const result = await draftOutreachEmailFlow(input);
    console.log('[draftOutreachEmail Flow] Successfully executed.');
    return result;
  } catch (error) {
    console.error('[draftOutreachEmail Flow] Error during execution:', error);
    // Fallback: produce a reasonable template email locally so UI doesn't block when AI is unavailable
    const emailDraft = generateFallbackEmail(input);
    return { emailDraft };
  }
}

const draftOutreachEmailPrompt = ai.definePrompt({
  name: 'draftOutreachEmailPrompt',
  input: {schema: DraftOutreachEmailInputSchema},
  output: {schema: DraftOutreachEmailOutputSchema},
  prompt: `You are an AI assistant tasked with drafting a personalized outreach email to a hair transplant surgeon on behalf of a user.

  Use the following information to generate a polite, professional, and engaging email. The email should inquire about a consultation and pricing.

  Surgeon Name: {{{surgeonName}}}
  Clinic Name: {{{clinicName}}}
  Surgeon Specialties: {{{surgeonSpecialties}}}
  User Notes: {{{userNotes}}}
  User Name: {{{userName}}}

  Draft Outreach Email:
`,
});

const draftOutreachEmailFlow = ai.defineFlow(
  {
    name: 'draftOutreachEmailFlow',
    inputSchema: DraftOutreachEmailInputSchema,
    outputSchema: DraftOutreachEmailOutputSchema,
  },
  async input => {
    console.log('[draftOutreachEmailFlow - Genkit Core] Attempting to call prompt with input:', input);
    try {
      const {output} = await draftOutreachEmailPrompt(input);
      if (!output) {
        console.error('[draftOutreachEmailFlow - Genkit Core] Prompt returned undefined output.');
        throw new Error('Prompt returned undefined output.');
      }
      console.log('[draftOutreachEmailFlow - Genkit Core] Successfully received output from prompt.');
      return output;
    } catch (flowError) {
      console.error('[draftOutreachEmailFlow - Genkit Core] Error calling prompt:', flowError);
      throw flowError;
    }
  }
);

function generateFallbackEmail(input: DraftOutreachEmailInput): string {
  const { surgeonName, clinicName, surgeonSpecialties, userNotes, userName } = input;
  const specialties = surgeonSpecialties || 'hair restoration';
  const notes = (userNotes || '').trim();
  const extra = notes ? `\n\nAdditional context: ${notes}` : '';
  return (
`Subject: Consultation Request – ${userName}

Dear ${surgeonName} and the ${clinicName} team,

I’m researching ${specialties.toLowerCase()} options and would like to request a consultation to discuss my case, donor capacity, recommended approach (FUE/FUT/robotic), estimated graft count, pricing, and expected timeline.

Could you please share:
- Available consultation slots (virtual or in-person)
- Typical price range and what’s included
- Recent case examples that match my situation
- Technician involvement and graft handling protocol
${extra}

Thank you for your time. I look forward to your reply.

Best regards,
${userName}`);
}
