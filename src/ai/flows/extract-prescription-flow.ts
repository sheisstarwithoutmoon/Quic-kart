'use server';
/**
 * @fileOverview An AI flow for extracting details from a medical prescription image.
 *
 * - extractPrescriptionDetails - A function that handles the prescription extraction process.
 * - ExtractPrescriptionInput - The input type for the extractPrescriptionDetails function.
 * - ExtractPrescriptionOutput - The return type for the extractPrescriptionDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPrescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a medical prescription, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractPrescriptionInput = z.infer<typeof ExtractPrescriptionInputSchema>;

const MedicineSchema = z.object({
    name: z.string().describe('The name of the medicine.'),
    dosage: z.string().describe('The dosage instruction (e.g., "500mg", "1 tablet").'),
    frequency: z.string().describe('The frequency of intake (e.g., "Twice a day", "Once daily before bed").'),
});

const ExtractPrescriptionOutputSchema = z.object({
  medicines: z.array(MedicineSchema).describe('A list of medicines extracted from the prescription.'),
  isReadable: z.boolean().describe('Whether the prescription image was clear and readable.'),
  error: z.string().optional().describe('Any error or reason why the prescription could not be read.'),
});
export type ExtractPrescriptionOutput = z.infer<typeof ExtractPrescriptionOutputSchema>;

export async function extractPrescriptionDetails(input: ExtractPrescriptionInput): Promise<ExtractPrescriptionOutput> {
  return extractPrescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPrescriptionPrompt',
  input: {schema: ExtractPrescriptionInputSchema},
  output: {schema: ExtractPrescriptionOutputSchema},
  prompt: `You are an expert pharmacist's assistant. Your task is to accurately read a medical prescription from an image and extract the details of each medicine.

Analyze the provided image. Perform OCR to read the text.

From the text, identify each medicine prescribed. For each medicine, extract its name, dosage (e.g., "500mg", "1 tablet"), and frequency (e.g., "Twice a day", "Once a day for 7 days").

If the image is blurry, unreadable, or not a prescription, set 'isReadable' to false and provide a reason in the 'error' field. Otherwise, set 'isReadable' to true and list the extracted medicines.

Image to analyze: {{media url=photoDataUri}}`,
});

const extractPrescriptionFlow = ai.defineFlow(
  {
    name: 'extractPrescriptionFlow',
    inputSchema: ExtractPrescriptionInputSchema,
    outputSchema: ExtractPrescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
