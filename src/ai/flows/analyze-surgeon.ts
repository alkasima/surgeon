'use server';

/**
 * @fileOverview Analyzes a surgeon's suitability based on public info and private tracking data.
 *
 * - analyzeSurgeon - A function that provides an AI-powered analysis of a surgeon's suitability.
 * - AnalyzeSurgeonInput - The input type for the analyzeSurgeon function.
 * - AnalyzeSurgeonOutput - The return type for the analyzeSurgeon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSurgeonInputSchema = z.object({
  surgeonPublicInfo: z
    .string()
    .describe('Publicly available information about the surgeon.'),
  userPrivateTrackingData: z
    .string()
    .describe('User-specific tracking data and notes about the surgeon.'),
});
export type AnalyzeSurgeonInput = z.infer<typeof AnalyzeSurgeonInputSchema>;

const AnalyzeSurgeonOutputSchema = z.object({
  suitabilityAnalysis: z.string().describe('A comprehensive analysis of the surgeon\'s suitability.'),
  suggestedNextSteps: z.string().describe('Suggested next steps based on the analysis.'),
});
export type AnalyzeSurgeonOutput = z.infer<typeof AnalyzeSurgeonOutputSchema>;

export async function analyzeSurgeon(input: AnalyzeSurgeonInput): Promise<AnalyzeSurgeonOutput> {
  console.log('[analyzeSurgeon Flow] Called with input.');
  try {
    const result = await analyzeSurgeonFlow(input);
    console.log('[analyzeSurgeon Flow] Successfully executed.');
    return result;
  } catch (error) {
    console.error('[analyzeSurgeon Flow] Error during execution:', error);
    // Consider how you want to propagate errors to the client
    // For now, re-throwing will make it visible in server logs.
    // You might want to return a specific error structure if the client needs to handle it.
    throw new Error(`Failed to analyze surgeon. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const analyzeSurgeonPrompt = ai.definePrompt({
  name: 'analyzeSurgeonPrompt',
  input: {schema: AnalyzeSurgeonInputSchema},
  output: {schema: AnalyzeSurgeonOutputSchema},
  prompt: `You are an AI assistant that analyzes surgeon suitability for hair transplants.

  Based on the following information, provide a comprehensive analysis of the surgeon's suitability and suggest next steps.

  Surgeon Public Information: {{{surgeonPublicInfo}}}
  User Private Tracking Data: {{{userPrivateTrackingData}}}

  Suitability Analysis:
  Suggested Next Steps: `,
});

const analyzeSurgeonFlow = ai.defineFlow(
  {
    name: 'analyzeSurgeonFlow',
    inputSchema: AnalyzeSurgeonInputSchema,
    outputSchema: AnalyzeSurgeonOutputSchema,
  },
  async input => {
    console.log('[analyzeSurgeonFlow - Genkit Core] Attempting to call prompt with input:', input);
    try {
      const {output} = await analyzeSurgeonPrompt(input);
      if (!output) {
        console.error('[analyzeSurgeonFlow - Genkit Core] Prompt returned undefined output.');
        throw new Error('Prompt returned undefined output.');
      }
      console.log('[analyzeSurgeonFlow - Genkit Core] Successfully received output from prompt.');
      return output;
    } catch (flowError) {
      console.error('[analyzeSurgeonFlow - Genkit Core] Error calling prompt:', flowError);
      throw flowError; // Re-throw to be caught by the outer try/catch
    }
  }
);
