
'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, Truck } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import type { Item } from '@/lib/types';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { recommendProductsAction } from '@/app/actions';
import type { RecommendProductsOutput } from '@/ai/flows/recommend-products-flow';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from './ui/skeleton';

interface ProductDetailClientProps {
  item: Item;
}

function SimilarProducts({ currentItem }: { currentItem: Item }) {
  const [recommendations, setRecommendations] = useState<RecommendProductsOutput['recommendations']>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await recommendProductsAction(currentItem);
      setRecommendations(result.recommendations);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItem.id]);

  return (
    <div className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Similar Products</h2>
        {isPending ? (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-40 w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        ) : recommendations.length > 0 ? (
            <Carousel
                opts={{
                align: "start",
                dragFree: true,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                {recommendations.map((rec) => (
                    <CarouselItem key={rec.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <Link href={`/product/${rec.id}`} className="group block h-full">
                        <Card className="overflow-hidden h-full flex flex-col">
                        <div className="relative aspect-square w-full">
                            <Image
                            src={rec.image}
                            alt={rec.name}
                            fill
                            className="object-contain transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint="product"
                            quality={95}
                            />
                            <Badge variant="secondary" className="absolute top-2 left-2 text-primary bg-primary/10 border-primary/20">{rec.reason}</Badge>
                        </div>
                        <CardContent className="p-3">
                            <h3 className="font-semibold text-sm leading-tight h-10 overflow-hidden">{rec.name}</h3>
                        </CardContent>
                        </Card>
                    </Link>
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4"/>
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4"/>
            </Carousel>
        ) : (
            <p className="text-muted-foreground text-sm">No similar products found.</p>
        )}
    </div>
  );
}


export default function ProductDetailClient({ item }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [deliveryTime, setDeliveryTime] = useState('...');

  useEffect(() => {
    // This effect runs only on the client-side, preventing hydration mismatch
    const now = new Date();
    now.setHours(now.getHours() + 1);

    const hours = now.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    // Convert to 12-hour format
    let displayHour = hours % 12;
    if (displayHour === 0) { // Handle midnight case
        displayHour = 12;
    }

    setDeliveryTime(`Today, before ${displayHour}${ampm}`);
  }, []);

  const isOutOfStock = item.stock === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/category/${item.category.toLowerCase()}`}>{item.category}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{item.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left column: Image gallery */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="relative w-full aspect-square border rounded-lg overflow-hidden mb-4">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-contain"
                data-ai-hint={item.category.toLowerCase()}
                quality={95}
              />
            </div>
          </div>
        </div>

        {/* Right column: Product Details */}
        <div className="lg:col-span-1">
          <h1 className="text-3xl font-bold text-foreground">{item.name}</h1>
          {item.storeName && item.storeId && (
            <Link href={`/store/${item.storeId}`} className="text-sm text-primary hover:underline cursor-pointer mt-1">
                Visit {item.storeName} Store
            </Link>
          )}
          
          <div className="flex items-center gap-2 my-4">
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
            </div>
            <p className="text-sm text-muted-foreground">(1019 ratings)</p>
          </div>

          <Separator />

          <div className="my-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">₹{item.price.toFixed(2)}</span>
              {item.mrp && <span className="text-lg text-muted-foreground line-through">MRP ₹{item.mrp.toFixed(2)}</span>}
              {item.discount && <Badge variant="destructive" className="text-lg py-1">{item.discount.replace(/[\(\)]/g, '')} OFF</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-foreground my-4">
            <Truck className="w-5 h-5 text-primary" />
            <span>Delivery by <span className="font-bold">{deliveryTime}</span></span>
          </div>

          <Button size="lg" className="w-full h-12 text-lg" onClick={() => addToCart(item)} disabled={isOutOfStock}>
            {isOutOfStock ? 'Out of Stock' : 'Add To Cart'}
          </Button>
          
          <Separator className="my-8" />

          <div>
              <h2 className="text-xl font-bold mb-2">Description</h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                  {item.description}
              </p>
          </div>

        </div>
      </div>
      
      <SimilarProducts currentItem={item as Item}/>
    </div>
  );
}
