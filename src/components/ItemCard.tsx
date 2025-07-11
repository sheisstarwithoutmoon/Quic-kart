
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { useCart } from '@/hooks/use-cart';
import type { Item } from '@/lib/types';
import { PlusCircle, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const { addToCart } = useCart();
  const isOutOfStock = item.stock === 0;

  return (
    <Card className="h-full flex flex-col overflow-hidden group">
      <Link href={`/product/${item.id}`} className="flex flex-col flex-grow">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={`${item.category.toLowerCase()}`}
              quality={95}
            />
            {item.offer && (
                 <Badge variant="destructive" className="absolute top-2 left-2 text-base py-1 px-3 shadow-lg z-10">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {item.offer}
                </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="destructive" className="absolute top-2 right-2 shadow-lg">
                Out of Stock
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 flex flex-col flex-grow">
          <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1 flex-grow">
            {item.description}
          </CardDescription>
        </CardContent>
      </Link>
      <div className="p-4 pt-0">
        <div className="flex justify-between items-center mt-4">
          <p className="text-xl font-bold text-card-foreground">₹{item.price.toFixed(2)}</p>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(item);
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isOutOfStock}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {isOutOfStock ? "Unavailable" : "Add"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
