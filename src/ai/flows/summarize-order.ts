'use server';

/**
 * @fileOverview Order summarization flow for generating a concise text message-style summary of the order.
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

// Add error handling and logging
export async function summarizeOrder(input: SummarizeOrderInput): Promise<SummarizeOrderOutput> {
  try {
    console.log('Input received:', JSON.stringify(input, null, 2));
    
    // Validate input
    const validatedInput = SummarizeOrderInputSchema.parse(input);
    console.log('Input validated successfully');
    
    const result = await summarizeOrderFlow(validatedInput);
    console.log('Summary generated:', result);
    
    return result;
  } catch (error) {
    console.error('Error in summarizeOrder:', error);
    
    // Return a fallback summary
    return {
      summary: `Order: ${input.items?.length || 0} items to ${input.deliveryAddress || 'address not specified'}`
    };
  }
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

Please provide a summary in this format: "Order confirmed: [X items] to [address]"`,
});

const summarizeOrderFlow = ai.defineFlow(
  {
    name: 'summarizeOrderFlow',
    inputSchema: SummarizeOrderInputSchema,
    outputSchema: SummarizeOrderOutputSchema,
  },
  async (input) => {
    try {
      console.log('Flow input:', input);
      
      const result = await prompt(input);
      console.log('Prompt result:', result);
      
      // Check if output exists and has the expected structure
      if (!result.output) {
        throw new Error('No output received from prompt');
      }
      
      // Validate the output structure
      const validatedOutput = SummarizeOrderOutputSchema.parse(result.output);
      
      return validatedOutput;
    } catch (error) {
      console.error('Error in summarizeOrderFlow:', error);
      
      // Generate a simple fallback summary
      const itemCount = input.items?.length || 0;
      const itemNames = input.items?.map(item => `${item.quantity} ${item.name}`).join(', ') || 'items';
      
      return {
        summary: `Order confirmed: ${itemCount} items (${itemNames}) to ${input.deliveryAddress}`
      };
    }
  }
);

// Alternative simpler function for testing
export async function summarizeOrderSimple(input: SummarizeOrderInput): Promise<SummarizeOrderOutput> {
  try {
    const itemCount = input.items?.length || 0;
    const totalQuantity = input.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const itemsList = input.items?.map(item => 
      `${item.quantity} ${item.name}${item.offer ? ` (${item.offer})` : ''}`
    ).join(', ') || 'No items';
    
    const hasDeals = input.items?.some(item => item.offer);
    
    let summary = `Order: ${totalQuantity} items (${itemsList}) → ${input.deliveryAddress}`;
    
    if (hasDeals) {
      summary += ' 🎉 Great deals included!';
    }
    
    return { summary };
  } catch (error) {
    console.error('Error in summarizeOrderSimple:', error);
    return { summary: 'Unable to generate order summary' };
  }
}

// Debug function to test your AI setup
export async function testAIConnection(): Promise<boolean> {
  try {
    const testInput = {
      items: [
        { name: 'Test Item', quantity: 1, offer: 'Test Offer' }
      ],
      deliveryAddress: 'Test Address'
    };
    
    const result = await prompt(testInput);
    console.log('AI test result:', result);
    
    return !!result.output;
  } catch (error) {
    console.error('AI connection test failed:', error);
    return false;
  }
}