'use server';
/**
 * @fileOverview An AI flow for describing an image to be used for visual search.
 *
 * - describeImage - A function that handles the image description process.
 * - DescribeImageInput - The input type for the describeImage function.
 * - DescribeImageOutput - The return type for the describeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DescribeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DescribeImageInput = z.infer<typeof DescribeImageInputSchema>;

const DescribeImageOutputSchema = z.object({
  description: z.string().describe('A concise search query describing the main product in the image.'),
  isProduct: z.boolean().describe('Whether a product could be identified in the image.')
});
export type DescribeImageOutput = z.infer<typeof DescribeImageOutputSchema>;

export async function describeImage(input: DescribeImageInput): Promise<DescribeImageOutput> {
  return describeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'describeImagePrompt',
  input: {schema: DescribeImageInputSchema},
  output: {schema: DescribeImageOutputSchema},
  prompt: `You are an expert at identifying grocery and pharmacy products from images. Your task is to analyze the provided image and generate a concise search query for the main product shown.

If a clear product is visible (like a head of cabbage, a bunch of bananas, a bottle of pills, a box of cereal, etc.), identify it and provide a short, effective search term in the 'description' field (e.g., "cabbage", "Tylenol Extra Strength", "Cheerios cereal"). Set 'isProduct' to true.

If the image does not contain a clear product, is blurry, or is irrelevant, set 'isProduct' to false and provide a brief explanation in the 'description' field (e.g., "No clear product visible", "Image is too blurry").

Image to analyze: {{media url=photoDataUri}}`,
});

const describeImageFlow = ai.defineFlow(
  {
    name: 'describeImageFlow',
    inputSchema: DescribeImageInputSchema,
    outputSchema: DescribeImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
