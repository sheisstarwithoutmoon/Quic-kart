
import { notFound } from 'next/navigation';
import { stores } from '@/lib/data';
import type { Item } from '@/lib/types';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getItemsFromFirestore } from '@/app/actions';

interface ProductPageProps {
  params: {
    itemId: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const allItems = await getItemsFromFirestore('quickart-essentials');
  const item = allItems.find((i) => i.id === params.itemId);

  if (!item) {
    notFound();
  }

  return <ProductDetailClient item={item as Item} />;
}
