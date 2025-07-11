
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Item } from '@/lib/types';
import ItemCard from '@/components/ItemCard';
import { getItemsFromFirestore } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { PackageSearch } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function CategoryPage() {
  const params = useParams();
  const categoryName = Array.isArray(params.name) ? params.name[0] : params.name;
  
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!categoryName) return;

      setLoading(true);
      
      const decodedCategoryName = decodeURIComponent(categoryName);
      
      const allItems = await getItemsFromFirestore('quickart-essentials');
      const categoryItems = allItems.filter(item => item.category.toLowerCase() === decodedCategoryName.toLowerCase());

      setItems(categoryItems);
      setLoading(false);
    }
    fetchData();
  }, [categoryName]);

  const formattedCategoryName = categoryName ? decodeURIComponent(categoryName).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Category';

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{formattedCategoryName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl font-bold mb-8">Shop {formattedCategoryName}</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg col-span-full">
            <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <PackageSearch className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Products Found
                </h3>
                <p className="text-muted-foreground">
                    There are currently no products available in the "{formattedCategoryName}" category.
                </p>
            </div>
        </div>
      )}
    </div>
  );
}
