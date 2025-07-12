
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
import { useState, useEffect } from 'react';
import { stores } from '@/lib/data';
import Logo from './Logo';
import { MobileNav } from './MobileNav';


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

  useEffect(() => {
    const savedPincode = localStorage.getItem('deliveryPincode');
    const savedLocation = localStorage.getItem('deliveryLocationName');
    if (savedPincode) {
      setPincode(savedPincode);
    }
    if (savedLocation) {
        setLocationName(savedLocation);
    } else if (savedPincode) {
        // Fetch location if only pincode is available
        handlePincodeSubmit(savedPincode);
    }
  }, []);
  
  const handlePincodeSubmit = (newPincode: string) => {
    if (newPincode && newPincode.length === 6) {
        localStorage.setItem('deliveryPincode', newPincode);
        setPincode(newPincode);
        // For now, we accept any 6 digit pincode without validation
        setLocationName(`Pincode: ${newPincode}`);
        localStorage.setItem('deliveryLocationName', `Pincode: ${newPincode}`);
        setPopoverOpen(false);
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
      <Button asChild variant="ghost" className="hidden md:flex"><Link href="/login" className="flex items-center gap-2">
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
                <div className="flex items-center gap-2 md:gap-6">
                    <MobileNav user={user} handleLogout={handleLogout} />
                    <Logo />
                    <div className="hidden md:flex items-center gap-2 border-l pl-6">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                             <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <button className="flex flex-col items-start text-left">
                                        <span className="text-xs font-bold uppercase tracking-wider">Deliver to</span>
                                        <div className="flex items-center text-sm font-bold text-foreground">
                                          <span className="truncate max-w-[150px]">{locationName || 'Select Pincode'}</span>
                                          <ChevronDown className="w-4 h-4 ml-1 flex-shrink-0" />
                                        </div>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const input = form.elements.namedItem('pincode') as HTMLInputElement;
                                    handlePincodeSubmit(input.value);
                                }}>
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
                                              <Input id="pincode" name="pincode" type="text" pattern="\d*" maxLength={6} defaultValue={pincode} />
                                              <Button type="submit">
                                                Apply
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
                   
                    <Button asChild variant="ghost" className="hidden md:flex">
                      <Link href="/deals" className="flex items-center gap-2">
                          <Tag className="w-5 h-5" />
                          <span>Deals</span>
                      </Link>
                    </Button>
                    <CartSheet />
                </div>
            </div>
            
            <nav className="hidden md:flex justify-between items-center h-12 border-t">
                <div className="flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link href={link.href} key={link.name} className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary">
                            <span>{link.name}</span>
                        </Link>
                    ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                     <ShoppingCart className="w-4 h-4"/>
                     <span className="text-muted-foreground font-medium truncate max-w-[250px]">{locationName ? `Delivering to: ${locationName}` : 'Order everything you need.'}</span>
                     <Link href={`/store/${mainStoreId}`} className="font-bold text-primary underline">SHOP NOW</Link>
                </div>
            </nav>
        </div>
    </header>
  );
}
