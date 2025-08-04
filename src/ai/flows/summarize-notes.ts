'use server';

/**
 * @fileOverview Summarizes notes about a surgeon.
 *
 * - summarizeNotes - A function that summarizes notes about a surgeon.
 * - SummarizeNotesInput - The input type for the summarizeNotes function.
 * - SummarizeNotesOutput - The return type for the summarizeNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNotesInputSchema = z.object({
  notes: z.string().describe('The notes to summarize.'),
  length: z
    .enum(['short', 'medium', 'long'])
    .describe('The desired length of the summary.'),
});
export type SummarizeNotesInput = z.infer<typeof SummarizeNotesInputSchema>;

const SummarizeNotesOutputSchema = z.object({
  summary: z.string().describe('The summary of the notes.'),
});
export type SummarizeNotesOutput = z.infer<typeof SummarizeNotesOutputSchema>;

export async function summarizeNotes(input: SummarizeNotesInput): Promise<SummarizeNotesOutput> {
  console.log(`[summarizeNotes Flow] Called with input length: ${input.length}`);
  try {
    const result = await summarizeNotesFlow(input);
    console.log('[summarizeNotes Flow] Successfully executed.');
    return result;
  } catch (error) {
    console.error('[summarizeNotes Flow] Error during execution:', error);
    throw new Error(`Failed to summarize notes. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const prompt = ai.definePrompt({
  name: 'summarizeNotesPrompt',
  input: {schema: SummarizeNotesInputSchema},
  output: {schema: SummarizeNotesOutputSchema},
  prompt: `You are an expert summarizer. You will be given notes about a surgeon, and you will summarize them in the following length: {{{length}}}.\n\nNotes: {{{notes}}}`,
});

const summarizeNotesFlow = ai.defineFlow(
  {
    name: 'summarizeNotesFlow',
    inputSchema: SummarizeNotesInputSchema,
    outputSchema: SummarizeNotesOutputSchema,
  },
  async input => {
    console.log('[summarizeNotesFlow - Genkit Core] Attempting to call prompt with input for length:', input.length);
    try {
      const {output} = await prompt(input);
      if (!output) {
        console.error('[summarizeNotesFlow - Genkit Core] Prompt returned undefined output.');
        throw new Error('Prompt returned undefined output.');
      }
      console.log('[summarizeNotesFlow - Genkit Core] Successfully received output from prompt.');
      return output;
    } catch (flowError) {
      console.error('[summarizeNotesFlow - Genkit Core] Error calling prompt:', flowError);
      throw flowError;
    }
  }
);
