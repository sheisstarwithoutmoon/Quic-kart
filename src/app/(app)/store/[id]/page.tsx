
import { stores } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ItemCard from '@/components/ItemCard';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getItemsFromFirestore } from '@/app/actions';
import type { Item } from '@/lib/types';

interface StorePageProps {
  params: {
    id: string;
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const store = stores.find((s) => s.id === params.id);

  if (!store) {
    notFound();
  }

  const firestoreItems = await getItemsFromFirestore(store.id);
  
  const categories = [...new Set(firestoreItems.map(item => item.category))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="pl-1">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </Button>
      </div>
      <header className="mb-12">
        <h1 className="font-bold text-4xl text-foreground">{store.name}</h1>
        <p className="text-muted-foreground text-lg mt-2">{store.description}</p>
      </header>

      {categories.map(category => {
         const itemsForCategory = firestoreItems.filter(item => item.category === category);
         if (itemsForCategory.length === 0) {
           return null;
         }
         
         return (
           <section key={category} className="mb-12">
              <h2 className="font-bold text-2xl mb-6 flex items-center gap-3 text-foreground">
                <Pill className="w-7 h-7 text-primary" />
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {itemsForCategory.map((item) => (
                  <ItemCard key={item.id} item={{...item, storeId: store.id, storeName: store.name}} />
                ))}
              </div>
           </section>
         )
      })}

      {firestoreItems.length === 0 && (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No items available in this store.</p>
            <p className="text-sm text-muted-foreground/80">Please check back later!</p>
          </div>
      )}
    </div>
  );
}
