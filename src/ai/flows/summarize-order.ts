
'use server';

/**
 * @fileOverview Order summarization flow for generating a concise text message-style summary of the order.
 *
 * - summarizeOrder - A function that generates the order summary.
 * - SummarizeOrderInput - The input type for the summarizeOrder function.
 * - SummarizeOrderOutput - The return type for the summarizeOrder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeOrderInputSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().describe('Name of the item.'),
      quantity: z.number().describe('Quantity of the item.'),
      offer: z.string().optional().describe('The special offer on the item, if any.'),
    })
  ).describe('List of items in the order.'),
  deliveryAddress: z.string().describe('The delivery address for the order.'),
});
export type SummarizeOrderInput = z.infer<typeof SummarizeOrderInputSchema>;

const SummarizeOrderOutputSchema = z.object({
  summary: z.string().describe('A concise text message-style summary of the order.'),
});
export type SummarizeOrderOutput = z.infer<typeof SummarizeOrderOutputSchema>;

export async function summarizeOrder(input: SummarizeOrderInput): Promise<SummarizeOrderOutput> {
  return summarizeOrderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeOrderPrompt',
  input: {schema: SummarizeOrderInputSchema},
  output: {schema: SummarizeOrderOutputSchema},
  prompt: `Summarize the following order in a concise text message-style format. Be as brief as possible.

Items:
{{#each items}}
- {{quantity}} {{name}}{{#if offer}} (Special Deal: {{offer}}){{/if}}
{{/each}}

Delivery Address: {{deliveryAddress}}

{{#if items.0.offer}}
PS: You've grabbed some great deals!
{{/if}}
`,
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
