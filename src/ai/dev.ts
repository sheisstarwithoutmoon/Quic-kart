import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-order-flows';
import '@/ai/flows/extract-prescription-flow.ts';
import '@/ai/flows/suggest-alternatives-flow.ts';
import '@/ai/flows/describe-image-flow.ts';
import '@/ai/flows/recommend-products-flow.ts';
