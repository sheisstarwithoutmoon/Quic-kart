'use server';
/**
 * @fileOverview An AI flow for recommending similar products.
 */

import { groqClient, TEXT_MODEL } from '@/ai/groq-client';
import { z } from 'zod';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  image: z.string(),
});
export type Product = z.infer<typeof ProductSchema>;

const RecommendProductsInputSchema = z.object({
  currentItem: ProductSchema,
  productList: z.array(ProductSchema),
});
export type RecommendProductsInput = z.infer<typeof RecommendProductsInputSchema>;

const RecommendationSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  reason: z.string(),
});

const RecommendProductsOutputSchema = z.object({
  recommendations: z.array(RecommendationSchema),
});
export type RecommendProductsOutput = z.infer<typeof RecommendProductsOutputSchema>;

export async function recommendProducts(input: RecommendProductsInput): Promise<RecommendProductsOutput> {
  // Filter out current item before sending to model
  const filteredList = input.productList.filter(p => p.id !== input.currentItem.id);

  const productsList = filteredList
    .map(p => `- ID: ${p.id}\n  Name: ${p.name}\n  Description: ${p.description}\n  Category: ${p.category}\n  Image: ${p.image}`)
    .join('\n');

  const response = await groqClient.chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a product recommendation engine for an online pharmacy and grocery store.

Your task:
1. Analyze the current product
2. Find up to 4 most similar or relevant products from the available list
3. Prioritize same category products
4. DO NOT recommend the current product itself
5. For each recommendation provide a short user-facing reason (e.g. "Also for bone health", "Similar multivitamin")

Respond with ONLY a JSON object in this format:
{
  "recommendations": [
    { "id": "...", "name": "...", "image": "...", "reason": "..." }
  ]
}
If no suitable alternatives, return empty recommendations array.`,
      },
      {
        role: 'user',
        content: `Current Product:
- Name: ${input.currentItem.name}
- Description: ${input.currentItem.description}
- Category: ${input.currentItem.category}

Available Products:
${productsList}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return { recommendations: result.recommendations || [] };
}