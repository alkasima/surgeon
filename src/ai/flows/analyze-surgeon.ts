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
    // Fallback: generate a simple heuristic analysis so UI continues to work when AI is unavailable
    const suitabilityAnalysis = simpleHeuristicAnalysis(input.surgeonPublicInfo, input.userPrivateTrackingData);
    const suggestedNextSteps = simpleNextSteps();
    return { suitabilityAnalysis, suggestedNextSteps };
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

function simpleHeuristicAnalysis(publicInfo: string, privateInfo: string): string {
  const base = `${publicInfo || ''} ${privateInfo || ''}`.toLowerCase();
  const hasFUE = base.includes('fue');
  const hasFUT = base.includes('fut');
  const hasRobotic = base.includes('robot');
  const strengths = [
    hasFUE && 'Experience with FUE',
    hasFUT && 'Experience with FUT',
    hasRobotic && 'Robotic capabilities',
  ].filter(Boolean).join('; ');
  return `Preliminary assessment based on available info. ${strengths ? `Strengths: ${strengths}.` : 'Limited specialty signals detected.'} Recommend verifying case counts, graft pricing, and patient results.`;
}

function simpleNextSteps(): string {
  return [
    'Request recent case photos (front, top, crown, donor).',
    'Ask for average graft survival rate and technician involvement.',
    'Confirm pricing per graft and what is included.',
    'Schedule a consultation to validate plan and donor capacity.',
  ].join(' ');
}
