import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import type { Store } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link href={`/store/${store.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:border-primary/50 group-hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={store.image}
              alt={store.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={`${store.type.toLowerCase()}`}
            />
          </div>
          <div className="p-6 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="font-headline text-2xl mb-1">{store.name}</CardTitle>
              <Badge variant="outline" className="shrink-0">{store.type}</Badge>
            </div>
            <CardDescription>{store.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
            <div className="flex items-center text-sm font-semibold text-primary group-hover:text-primary/80">
                <span>View Products</span>
                <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}
