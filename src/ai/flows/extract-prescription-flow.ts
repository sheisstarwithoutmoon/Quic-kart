'use server';
/**
 * @fileOverview An AI flow for extracting details from a medical prescription image.
 */

import { groqClient, VISION_MODEL } from '@/ai/groq-client';
import { z } from 'zod';

const ExtractPrescriptionInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a medical prescription as a data URI."),
});
export type ExtractPrescriptionInput = z.infer<typeof ExtractPrescriptionInputSchema>;

const MedicineSchema = z.object({
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
});

const ExtractPrescriptionOutputSchema = z.object({
  medicines: z.array(MedicineSchema),
  isReadable: z.boolean(),
  error: z.string().optional(),
});
export type ExtractPrescriptionOutput = z.infer<typeof ExtractPrescriptionOutputSchema>;

export async function extractPrescriptionDetails(input: ExtractPrescriptionInput): Promise<ExtractPrescriptionOutput> {
  const response = await groqClient.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are an expert pharmacist's assistant. Read this medical prescription image and extract medicine details.

For each medicine, extract: name, dosage (e.g. "500mg", "1 tablet"), and frequency (e.g. "Twice a day").

If the image is blurry, unreadable, or not a prescription, set isReadable to false with an error message.

Respond with ONLY a JSON object in this format:
{
  "isReadable": true,
  "medicines": [
    { "name": "...", "dosage": "...", "frequency": "..." }
  ],
  "error": null
}`,
          },
          {
            type: 'image_url',
            image_url: { url: input.photoDataUri },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return {
    medicines: result.medicines || [],
    isReadable: result.isReadable ?? false,
    error: result.error || undefined,
  };
}