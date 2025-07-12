'use server';
/**
 * @fileOverview An AI flow for generating a friendly order summary.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const OrderItemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
});

const SummarizeOrderInputSchema = z.object({
  items: z.array(OrderItemSchema).describe('The list of items in the order.'),
  total: z.number().describe('The total cost of the order.'),
  deliveryAddress: z.string().describe('The delivery address for the order.'),
});
export type SummarizeOrderInput = z.infer<typeof SummarizeOrderInputSchema>;

const SummarizeOrderOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A short, friendly, text-message-style confirmation for the order.'
    ),
});
export type SummarizeOrderOutput = z.infer<typeof SummarizeOrderOutputSchema>;

export async function summarizeOrder(
  input: SummarizeOrderInput
): Promise<SummarizeOrderOutput> {
  return summarizeOrderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeOrderPrompt',
  input: {schema: SummarizeOrderInputSchema},
  output: {schema: SummarizeOrderOutputSchema},
  prompt: `You are an AI for Quickart, a local delivery app. Your task is to generate a short, friendly, text-message-style confirmation summary for an order.

**Guidelines:**
- Start with a confirmation like "Your Quickart order for ₹{total} is confirmed!".
- List the items included.
- Mention the delivery address.
- End with a friendly closing like "We'll let you know when it's on the way!".
- Keep it concise and conversational.

**Order Details:**
- Total: ₹{{total}}
- Items:
{{#each items}}
- {{quantity}}x {{name}}
{{/each}}
- Address: {{deliveryAddress}}`,
});

const summarizeOrderFlow = ai.defineFlow(
  {
    name: 'summarizeOrderFlow',
    inputSchema: SummarizeOrderInputSchema,
    outputSchema: SummarizeOrderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
