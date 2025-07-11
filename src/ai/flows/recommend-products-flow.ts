'use server';
/**
 * @fileOverview An AI flow for recommending similar products.
 */

import { ai } from '@/ai/genkit';
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
  currentItem: ProductSchema.describe('The product for which to find alternatives.'),
  productList: z.array(ProductSchema).describe('A list of all available products in the store to compare against.'),
});
export type RecommendProductsInput = z.infer<typeof RecommendProductsInputSchema>;

const RecommendationSchema = z.object({
    id: z.string().describe("The ID of the recommended product."),
    name: z.string().describe('The name of the recommended product.'),
    image: z.string().describe('The image URL of the recommended product.'),
    reason: z.string().describe("A very brief, compelling reason why this is a good recommendation for the user (e.g., 'Similar composition' or 'Also for bone health')."),
});

const RecommendProductsOutputSchema = z.object({
  recommendations: z.array(RecommendationSchema).describe('A list of up to 4 recommended similar products. Do not include the currentItem in this list.'),
});
export type RecommendProductsOutput = z.infer<typeof RecommendProductsOutputSchema>;


export async function recommendProducts(input: RecommendProductsInput): Promise<RecommendProductsOutput> {
  return recommendProductsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendProductsPrompt',
  input: { schema: RecommendProductsInputSchema },
  output: { schema: RecommendProductsOutputSchema },
  prompt: `You are a product recommendation engine for an online pharmacy and grocery store. Your goal is to suggest relevant and helpful alternative products to the user.

**Current Product:**
- Name: {{currentItem.name}}
- Description: {{currentItem.description}}
- Category: {{currentItem.category}}

**Available Products for Recommendation:**
{{#each productList}}
- ID: {{id}}
  Name: {{name}}
  Description: {{description}}
  Category: {{category}}
  Image: {{image}}
{{/each}}

**Your Task:**
1.  Analyze the **Current Product**.
2.  From the **Available Products for Recommendation** list, identify up to **4** products that are the most similar or relevant.
3.  Prioritize products in the same category. Also consider products that treat similar conditions or have similar ingredients based on their name and description.
4.  **Crucially, DO NOT recommend the Current Product itself.** Filter it out from your suggestions.
5.  For each recommendation, provide a very short, user-facing \`reason\` for the suggestion. For example: "Also for bone health", "Similar multivitamin", "Alternative pain reliever".
6.  Return the results in the specified output format. If no suitable alternatives are found, return an empty \`recommendations\` array.`,
});

const recommendProductsFlow = ai.defineFlow(
  {
    name: 'recommendProductsFlow',
    inputSchema: RecommendProductsInputSchema,
    outputSchema: RecommendProductsOutputSchema,
  },
  async (input) => {
    // Filter out the current item from the list before sending to the model
    const filteredProductList = input.productList.filter(p => p.id !== input.currentItem.id);
    const { output } = await prompt({
        ...input,
        productList: filteredProductList
    });
    return output!;
  }
);
