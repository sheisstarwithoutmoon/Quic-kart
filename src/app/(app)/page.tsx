
import {
  ChevronRight,
  ShoppingCart,
  Clock,
  Tag,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import PrescriptionUpload from '@/components/PrescriptionUpload';
import SearchBar from '@/components/SearchBar';
import { searchItemsFromFirestore } from '../actions';
import { stores } from '@/lib/data';
import AnimatedHeading from './animation';

const categories = [
  { name: 'Groceries', image: 'https://i.ibb.co/chCJwJFp/Untitled-design-6.png', 'data-ai-hint': 'groceries', offer: 'SAVE 25%', href: '/category/groceries' },
  { name: 'Snacks', image: 'https://i.ibb.co/VWVfZH2s/Untitled-design-7.png', 'data-ai-hint': 'snacks', offer: 'UPTO 70% OFF', href: '/category/snacks' },
  { name: 'Medicine', image: 'https://i.ibb.co/7J9bbYRb/Untitled-design-8.png', 'data-ai-hint': 'medicine', offer: '', href: '/category/medicine' },
  { name: 'Stationery', image: 'https://i.ibb.co/yrNys2Z/Untitled-design-12.png', 'data-ai-hint': 'stationery pencils', offer: '', href: '/category/stationery' },
  { name: 'Value Store', image: 'https://i.ibb.co/zTpK0ncD/Untitled-design-9.png', 'data-ai-hint': 'storefront', offer: 'UPTO 50% OFF', href: '/value-store' },
  { name: 'Deals', image: 'https://i.ibb.co/pj06pNMf/Untitled-design-11.png', 'data-ai-hint': 'sale discount', offer: '', href: '/deals' },
];


export default async function Home() {
  const trendingProducts = await searchItemsFromFirestore(''); // Fetch all items from Firestore
  const mainStoreId = stores.length > 0 ? stores[0].id : '#';

  return (
    <div className="bg-background">
      {/* Search Section */}
      <section className="relative w-full h-[300px] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/110"></div>
        <Image
            src="https://i.ibb.co/SDYXJWHb/Your-Health-Matters-1.png"
            alt="Hero banner with groceries and a pharmacy storefront"
            fill
            className="object-cover"
            data-ai-hint="storefront groceries"
            priority
            quality={95}
          
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-4">
              {/* <h1 className="text-4xl md:text-5xl font-bold text-white shadow-md">Anything you need, delivered.</h1> */}
              <AnimatedHeading />
              <p className="text-lg text-white/90 mt-2 shadow-md">Your favorite local stores, now online.</p>
          </div>
          <SearchBar />
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link href={category.href} key={category.name} className="group text-center">
                <div className="relative mb-2 w-full aspect-square overflow-hidden rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                   <Image
                     src={category.image}
                     alt={category.name}
                     fill
                     className="object-cover transition-transform group-hover:scale-105"
                     data-ai-hint={category['data-ai-hint']}
                   />
                </div>
                <p className="font-semibold text-sm text-foreground">{category.name}</p>
                {category.offer && (
                  <p className="text-xs font-bold text-red-500">{category.offer}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Order with Prescription Section */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <PrescriptionUpload />
        </div>
      </section>

      {/* Special Banner Section */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
           <Card className="max-w-5xl mx-auto bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <ShoppingCart className="w-8 h-8 text-primary"/>
                        <div>
                            <p className="font-bold text-foreground">Everything you need, delivered fast</p>
                            <p className="text-sm text-muted-foreground">START SHOPPING NOW & get delivered</p>
                        </div>
                    </div>
                    <Button variant="ghost" asChild>
                       <Link href={`/store/${mainStoreId}`}>
                         Shop Now <ChevronRight className="w-4 h-4 ml-2"/>
                       </Link>
                    </Button>
                </CardContent>
           </Card>
        </div>
      </section>

      {/* Trending Near You Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground">Trending Near You</h2>
                <p className="text-muted-foreground">Popular in your city</p>
            </div>
            <Carousel
                opts={{
                    align: "start",
                    dragFree: true,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                    {trendingProducts.map((item) => (
                        <CarouselItem key={item.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5">
                            <Link href={`/product/${item.id}`} className="group block h-full">
                                <Card className="overflow-hidden h-full flex flex-col">
                                    <div className="relative aspect-square w-full">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-contain transition-transform duration-300 group-hover:scale-105"
                                            data-ai-hint={`${item.category.toLowerCase()}`}
                                        />
                                    </div>
                                    <CardContent className="p-3 flex flex-col items-start gap-2 flex-grow">
                                        <h3 className="font-semibold text-sm leading-tight h-10 overflow-hidden">{item.name}</h3>
                                        <div className="flex-grow"></div>
                                        <div className="text-xs text-muted-foreground">
                                            {item.mrp && <span className="line-through">MRP ₹{item.mrp.toFixed(2)}</span>}
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <p className="font-bold text-foreground">₹{item.price.toFixed(2)}</p>
                                            {item.discount && <p className="text-sm font-bold text-green-600">{item.discount}</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4"/>
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4"/>
            </Carousel>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Why Choose Us?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
            <div className="p-6">
              <div className="flex justify-center items-center mb-4">
                <div className="bg-primary/10 rounded-full p-4">
                  <Clock className="w-10 h-10 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">30-Minute Delivery</h3>
              <p className="text-muted-foreground text-sm">Products delivered in 30 minutes, delivery free on orders above ₹1500.</p>
            </div>
            <div className="p-6">
              <div className="flex justify-center items-center mb-4">
                <div className="bg-primary/10 rounded-full p-4">
                  <Tag className="w-10 h-10 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Best Prices &amp; Offers</h3>
              <p className="text-muted-foreground text-sm">Best prices &amp; offers on a wide range of products.</p>
            </div>
            <div className="p-6">
              <div className="flex justify-center items-center mb-4">
                <div className="bg-primary/10 rounded-full p-4">
                  <Package className="w-10 h-10 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Wide Assortment</h3>
              <p className="text-muted-foreground text-sm">A wide assortment of 5000+ products.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
