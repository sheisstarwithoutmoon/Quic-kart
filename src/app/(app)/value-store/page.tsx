
import { searchItemsFromFirestore } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Gift, Sparkles, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ItemCard from '@/components/ItemCard';


export default async function ValueStorePage() {
    const allItems = await searchItemsFromFirestore('');
    // Select a few items to feature, e.g., the first 6
    const featuredItems = allItems.slice(0, 6);

  return (
    <div className="bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <Gift className="w-16 h-16 text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Value Store</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Amazing combos and special offers you can't resist!
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredItems.map((item, index) => {
                    const offerType = index % 2 === 0 ? "Buy 1 Get 1 Free" : "Combo Deal";
                    // Add the offer to the item object before passing to ItemCard
                    const itemWithOffer = { ...item, offer: offerType };
                    
                    return (
                        <Card key={item.id} className="h-full flex flex-col overflow-hidden group border-2 border-transparent hover:border-primary transition-all">
                             <ItemCard item={itemWithOffer} />
                        </Card>
                    )
                })}
            </div>
            
            {featuredItems.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed rounded-lg col-span-full">
                    <h3 className="text-xl font-semibold">No special offers right now, check back soon!</h3>
                </div>
            )}
        </div>
    </div>
  );
}
