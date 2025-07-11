
'use client';

import Link from 'next/link';
import { MapPin, ChevronDown, User, Tag, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { CartSheet } from './CartSheet';
import { Skeleton } from './ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useState, useEffect, useTransition } from 'react';
import { stores } from '@/lib/data';
import Logo from './Logo';

const navLinks = [
    { name: 'Groceries', href: '/category/groceries' },
    { name: 'Snacks', href: '/category/snacks' },
    { name: 'Medicine', href: '/category/medicine' },
    { name: 'Stationery', href: '/category/stationery' },
    { name: 'Value Store', href: '/value-store' },
];


export default function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [pincode, setPincode] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isFetchingLocation, startFetchingLocation] = useTransition();

  useEffect(() => {
    const savedPincode = localStorage.getItem('deliveryPincode');
    const savedLocation = localStorage.getItem('deliveryLocationName');
    if (savedPincode) {
      setPincode(savedPincode);
    }
    if (savedLocation) {
        setLocationName(savedLocation);
    }
  }, []);
  
  const handlePincodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('pincode') as HTMLInputElement;
    const newPincode = input.value;
    
    if (newPincode.length >= 5) {
      startFetchingLocation(async () => {
        try {
          const response = await fetch(`https://api.postalpincode.in/pincode/${newPincode}`);
          const data = await response.json();
          if (data && data[0] && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            const newLocationName = `${postOffice.District}, ${postOffice.State}`;
            setLocationName(newLocationName);
            setPincode(newPincode);
            localStorage.setItem('deliveryPincode', newPincode);
            localStorage.setItem('deliveryLocationName', newLocationName);
            setPopoverOpen(false);
          } else {
            setLocationName('Invalid Pincode');
          }
        } catch (error) {
          console.error("Failed to fetch pincode data:", error);
          setLocationName('Could not fetch location');
        }
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const AuthButtons = () => {
    if (loading) {
      return <Skeleton className="h-8 w-24" />;
    }
    if (user) {
      return (
        <DropdownMenu>
           <DropdownMenuTrigger asChild>
               <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                           {getInitials(user.name || 'U')}
                       </AvatarFallback>
                   </Avatar>
                   <span className='hidden md:inline'>Hello, {user.name?.split(' ')[0]}</span>
               </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end">
               <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={() => router.push('/dashboard')}>Dashboard</DropdownMenuItem>
               <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
           </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
      <Button asChild variant="ghost"><Link href="/login" className="flex items-center gap-2">
          <User className="w-5 h-5" />
          <span>Log in</span>
      </Link></Button>
    );
  }

  const mainStoreId = stores.length > 0 ? stores[0].id : '#';

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
                {/* Left Side */}
                <div className="flex items-center gap-6">
                    <Logo />
                     <div className="hidden md:flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                             <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <button className="flex flex-col items-start">
                                        <span className="text-xs font-bold uppercase tracking-wider">Deliver to</span>
                                        <div className="flex items-center text-sm font-bold text-foreground">
                                          {pincode || 'Select Pincode'} <ChevronDown className="w-4 h-4 ml-1" />
                                        </div>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                <form onSubmit={handlePincodeSubmit}>
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Select Delivery Location</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Enter your pincode to see products available in your area.
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="pincode">Pincode</Label>
                                            <div className="flex items-center gap-2">
                                              <Input id="pincode" name="pincode" type="text" pattern="d*" maxLength={6} defaultValue={pincode} />
                                              <Button type="submit" disabled={isFetchingLocation}>
                                                {isFetchingLocation ? <Loader2 className="animate-spin" /> : 'Apply'}
                                              </Button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2 md:gap-4 text-sm">
                    <AuthButtons />
                   
                    <Button asChild variant="ghost">
                      <Link href="/deals" className="flex items-center gap-2">
                          <Tag className="w-5 h-5" />
                          <span>Deals</span>
                      </Link>
                    </Button>
                    <CartSheet />
                </div>
            </div>
        </div>
        <div className='border-t'>
            <div className="container mx-auto px-4 flex justify-between items-center h-14">
                 <nav className="flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link href={link.href} key={link.name} className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary">
                            <span>{link.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="flex items-center gap-2 text-sm">
                    <ShoppingCart className='w-4 h-4'/>
                    <p>Order everything you need. <Link href={`/store/${mainStoreId}`} className='font-bold underline text-primary'>SHOP NOW</Link></p>
                </div>
            </div>
        </div>
    </header>
  );
}
