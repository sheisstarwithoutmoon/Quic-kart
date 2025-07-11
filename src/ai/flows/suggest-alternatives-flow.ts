'use server';
/**
 * @fileOverview An AI flow for suggesting product alternatives.
 */

import { ai } from '@/ai/genkit';
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
    name: z.string().describe('The name of the suggested product.'),
    description: z.string().describe('The description of the suggested product.'),
    reason: z.string().describe("A brief reason why this is a good alternative."),
});

const SuggestAlternativesOutputSchema = z.object({
  responseMessage: z.string().describe("A friendly, conversational response to the user, incorporating the suggestions if any."),
  suggestions: z.array(SuggestionSchema).describe('A list of suggested alternative products.'),
});
export type SuggestAlternativesOutput = z.infer<typeof SuggestAlternativesOutputSchema>;


export async function suggestAlternatives(input: SuggestAlternativesInput): Promise<SuggestAlternativesOutput> {
  return suggestAlternativesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAlternativesPrompt',
  input: { schema: SuggestAlternativesInputSchema },
  output: { schema: SuggestAlternativesOutputSchema },
  prompt: `You are 'Q', the friendly, empathetic, and knowledgeable AI shopping assistant for Quickart, an online store for groceries and essentials. Your primary goal is to provide excellent customer service by helping users find product alternatives.

**IMPORTANT RULES:**
1.  **NEVER give medical advice.** You are not a pharmacist or a doctor. If a user asks for medical advice (e.g., "which of these is better for a headache?"), you MUST politely decline and advise them to consult a healthcare professional.
2.  **ONLY suggest products from the provided list.** Do not invent products or suggest items that are not in the \`products\` list.
3.  **Suggest up to 3 alternatives.** Do not overwhelm the user with too many options.
4.  **Be conversational and friendly.** Start with a warm greeting. Use a helpful and understanding tone.

**User's Request:** "{{query}}"

**Available Products:**
{{#each products}}
- Name: {{name}}
  Description: {{description}}
  Category: {{category}}
{{/each}}

**Your Task:**
Based on the user's request, find the most suitable alternatives from the list of available products.

- **If you find good alternatives:**
  - Create a friendly \`responseMessage\` that acknowledges their request and clearly lists your suggestions.
  - Populate the \`suggestions\` array with the product details. For each suggestion, provide a concise \`reason\` explaining why it's a good alternative (e.g., "it's in the same category and serves a similar purpose").

- **If you cannot find any suitable alternatives:**
  - Create a friendly \`responseMessage\` explaining that you couldn't find a good match in the current inventory. You can suggest they try rephrasing their search.
  - The \`suggestions\` array should be empty.`,
});

const suggestAlternativesFlow = ai.defineFlow(
  {
    name: 'suggestAlternativesFlow',
    inputSchema: SuggestAlternativesInputSchema,
    outputSchema: SuggestAlternativesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
