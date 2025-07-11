
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Item } from '@/lib/types';
import ItemCard from '@/components/ItemCard';
import { Button } from '@/components/ui/button';
import { PackageSearch, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { searchItemsFromFirestore } from '../../actions';
import SearchBar from '@/components/SearchBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState<Item[]>([]);

  // Filter and Sort State
  const [sortOrder, setSortOrder] = useState('relevance');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [showInStock, setShowInStock] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (searchQuery) {
        const firestoreItems = await searchItemsFromFirestore(searchQuery);
        setAllItems(firestoreItems);
        
        const maxItemPrice = firestoreItems.reduce((max, item) => item.price > max ? item.price : max, 0);
        setMaxPrice(Math.ceil(maxItemPrice) || 1000);

      } else {
        setAllItems([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [searchQuery]);

  const categories = useMemo(() => {
    return [...new Set(allItems.map(item => item.category))];
  }, [allItems]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const filteredAndSortedItems = useMemo(() => {
    let items = [...allItems];

    if (selectedCategories.length > 0) {
      items = items.filter(item => selectedCategories.includes(item.category));
    }

    items = items.filter(item => item.price <= maxPrice);

    if (showInStock) {
      items = items.filter(item => item.stock > 0);
    }

    switch (sortOrder) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.price - a.price);
        break;
    }

    return items;
  }, [allItems, sortOrder, selectedCategories, maxPrice, showInStock]);


  const FiltersComponent = () => (
    <div className="space-y-6">
        <div>
            <Label className="text-lg font-semibold">Sort by</Label>
            <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-2">Category</h3>
            <div className="space-y-2">
                {categories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => handleCategoryChange(category)}
                        />
                        <Label htmlFor={category} className="font-normal">{category}</Label>
                    </div>
                ))}
            </div>
        </div>
         <div>
            <h3 className="text-lg font-semibold mb-2">Price Range</h3>
            <Slider
                value={[maxPrice]}
                max={Math.ceil(allItems.reduce((max, item) => item.price > max ? item.price : max, 0)) || 1000}
                step={10}
                onValueChange={(value) => setMaxPrice(value[0])}
            />
            <p className="text-sm text-muted-foreground mt-2 text-right">Up to ₹{maxPrice}</p>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-2">Availability</h3>
            <div className="flex items-center space-x-2">
                <Switch id="in-stock" checked={showInStock} onCheckedChange={setShowInStock} />
                <Label htmlFor="in-stock">Show only in-stock</Label>
            </div>
        </div>
        <Button variant="outline" className='w-full' onClick={() => {
            setSortOrder('relevance');
            setSelectedCategories([]);
            setMaxPrice(Math.ceil(allItems.reduce((max, item) => item.price > max ? item.price : max, 0)) || 1000);
            setShowInStock(false);
        }}>Clear Filters</Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="mb-8">
        <SearchBar />
       </div>

      {searchQuery ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar (Desktop) */}
            <aside className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24 p-6 border rounded-lg bg-card">
                    <h2 className="text-2xl font-bold mb-4">Filters</h2>
                    <FiltersComponent />
                </div>
            </aside>
            
            {/* Search Results */}
            <main className="lg:col-span-3">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Search Results
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Showing {filteredAndSortedItems.length} results for <span className="font-semibold text-foreground">"{searchQuery}"</span>
                        </p>
                    </div>
                    <div className='lg:hidden'>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline"><SlidersHorizontal className="mr-2 h-4 w-4" /> Filters</Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Filters</SheetTitle>
                                </SheetHeader>
                                <div className="p-4 overflow-y-auto">
                                   <FiltersComponent />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                    </div>
                ) : filteredAndSortedItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredAndSortedItems.map((item) => (
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
                            <p className="text-muted-foreground mb-4">
                                We couldn't find any products matching your search or filters. Try a different term or adjust your filters.
                            </p>
                            <Button asChild>
                                <Link href="/">Browse All Stores</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
      ) : (
        <h1 className="text-3xl font-bold mb-8">
            Please enter a search term to find products.
        </h1>
      )}
    </div>
  );
}
