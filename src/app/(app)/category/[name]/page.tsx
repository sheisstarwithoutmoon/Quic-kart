'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Item } from '@/lib/types';
import ItemCard from '@/components/ItemCard';
import { getItemsFromFirestore } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { PackageSearch } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// Skeleton component that matches ItemCard layout
function ItemCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Skeleton className="w-full aspect-square rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

// Circular loading component
function CircularLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-muted rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-muted-foreground text-sm">Loading products...</p>
    </div>
  );
}

// Full page skeleton for initial loading
function CategoryPageSkeleton({ categoryName }: { categoryName: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-4 w-48 mb-6" />
      <Skeleton className="h-8 w-64 mb-8" />
      <CircularLoading />
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const categoryName = Array.isArray(params.name) ? params.name[0] : params.name;
  
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!categoryName) return;

      setLoading(true);
      setError(null);
      
      try {
        const decodedCategoryName = decodeURIComponent(categoryName);
        
        const allItems = await getItemsFromFirestore('quickart-essentials');
        const categoryItems = allItems.filter(item => 
          item.category.toLowerCase() === decodedCategoryName.toLowerCase()
        );

        setItems(categoryItems);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Error fetching category items:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [categoryName]);

  const formattedCategoryName = categoryName ? 
    decodeURIComponent(categoryName).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
    'Category';

  // Show full page skeleton during initial load
  if (loading && items.length === 0) {
    return <CategoryPageSkeleton categoryName={formattedCategoryName} />;
  }

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
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Shop {formattedCategoryName}</h1>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Loading products...
          </div>
        )}
      </div>
      
      {error ? (
        <div className="text-center py-20 border-2 border-dashed border-destructive/20 rounded-lg bg-destructive/5">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <PackageSearch className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Failed to Load Products
            </h3>
            <p className="text-muted-foreground mb-4">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : loading ? (
        <CircularLoading />
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