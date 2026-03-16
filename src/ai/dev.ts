import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-order-flows';
import '@/ai/flows/extract-prescription-flow';
import '@/ai/flows/suggest-alternatives-flow';
import '@/ai/flows/describe-image-flow';
import '@/ai/flows/recommend-products-flow';