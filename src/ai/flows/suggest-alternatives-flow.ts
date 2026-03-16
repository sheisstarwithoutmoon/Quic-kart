'use server';
/**
 * @fileOverview An AI flow for suggesting product alternatives.
 */

import { groqClient, TEXT_MODEL } from '@/ai/groq-client';
import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
});

const SuggestAlternativesInputSchema = z.object({
  query: z.string().describe('The user query, e.g., "alternative for Tylenol"'),
  products: z.array(ProductSchema).describe('A list of available products to suggest from.'),
});
export type SuggestAlternativesInput = z.infer<typeof SuggestAlternativesInputSchema>;

const SuggestionSchema = z.object({
  name: z.string(),
  description: z.string(),
  reason: z.string(),
});

const SuggestAlternativesOutputSchema = z.object({
  responseMessage: z.string(),
  suggestions: z.array(SuggestionSchema),
});
export type SuggestAlternativesOutput = z.infer<typeof SuggestAlternativesOutputSchema>;

export async function suggestAlternatives(input: SuggestAlternativesInput): Promise<SuggestAlternativesOutput> {
  const productsList = input.products
    .map(p => `- Name: ${p.name}\n  Description: ${p.description}\n  Category: ${p.category}`)
    .join('\n');

  const response = await groqClient.chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are 'Q', the friendly AI shopping assistant for Quickart, an online grocery and essentials store.

IMPORTANT RULES:
1. NEVER give medical advice. If asked, politely decline and advise consulting a healthcare professional.
2. ONLY suggest products from the provided list. Do not invent products.
3. Suggest up to 3 alternatives max.
4. Be conversational and friendly.

Respond with ONLY a JSON object in this format:
{
  "responseMessage": "friendly message to user",
  "suggestions": [
    { "name": "...", "description": "...", "reason": "brief reason why it's a good alternative" }
  ]
}
If no alternatives found, return an empty suggestions array.`,
      },
      {
        role: 'user',
        content: `User's Request: "${input.query}"

Available Products:
${productsList}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return {
    responseMessage: result.responseMessage || "I couldn't find any suitable alternatives right now.",
    suggestions: result.suggestions || [],
  };
}