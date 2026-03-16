'use server';
/**
 * @fileOverview An AI flow for generating a friendly order summary.
 */

import { groqClient, TEXT_MODEL } from '@/ai/groq-client';
import { z } from 'zod';

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
  summary: z.string().describe('A short, friendly, text-message-style confirmation for the order.'),
});
export type SummarizeOrderOutput = z.infer<typeof SummarizeOrderOutputSchema>;

export async function summarizeOrder(input: SummarizeOrderInput): Promise<SummarizeOrderOutput> {
  const itemsList = input.items.map(i => `- ${i.quantity}x ${i.name}`).join('\n');

  const response = await groqClient.chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an AI for Quickart, a local delivery app. Generate a short, friendly, text-message-style order confirmation summary.
Guidelines:
- Start with "Your Quickart order for ₹{total} is confirmed!"
- List the items included
- Mention the delivery address
- End with "We'll let you know when it's on the way!"
- Keep it concise and conversational
Respond with ONLY a JSON object in this format: {"summary": "..."}`,
      },
      {
        role: 'user',
        content: `Order Details:
- Total: ₹${input.total}
- Items:
${itemsList}
- Address: ${input.deliveryAddress}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return { summary: result.summary || '' };
}