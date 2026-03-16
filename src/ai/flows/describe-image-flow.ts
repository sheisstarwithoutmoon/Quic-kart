'use server';
/**
 * @fileOverview An AI flow for describing an image to be used for visual search.
 */

import { groqClient, VISION_MODEL } from '@/ai/groq-client';
import { z } from 'zod';

const DescribeImageInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a product as a data URI."),
});
export type DescribeImageInput = z.infer<typeof DescribeImageInputSchema>;

const DescribeImageOutputSchema = z.object({
  description: z.string(),
  isProduct: z.boolean(),
});
export type DescribeImageOutput = z.infer<typeof DescribeImageOutputSchema>;

export async function describeImage(input: DescribeImageInput): Promise<DescribeImageOutput> {
  const response = await groqClient.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are an expert at identifying grocery and pharmacy products from images.

Analyze this image. If a clear product is visible (e.g. a head of cabbage, a bottle of pills, a box of cereal), identify it and provide a short search term in 'description' (e.g. "cabbage", "Tylenol Extra Strength"). Set 'isProduct' to true.

If no clear product is visible, set 'isProduct' to false and explain briefly in 'description'.

Respond with ONLY a JSON object:
{ "description": "...", "isProduct": true/false }`,
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
    description: result.description || 'No product identified',
    isProduct: result.isProduct ?? false,
  };
}