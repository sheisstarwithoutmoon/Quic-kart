
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import {
  Home,
  LogOut,
  Package,
  ScrollText,
  User,
  PanelLeft,
  Loader2,
  AlertCircle,
  Truck,
  IndianRupee,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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


  const consumerLinks = [
    { href: '/dashboard', label: 'Order History', icon: ScrollText },
    { href: '/dashboard/profile', label: 'My Profile', icon: User },
  ];

  const storeOwnerLinks = [
    { href: '/dashboard', label: 'Live Orders', icon: ScrollText },
    { href: '/dashboard/inventory', label: 'Inventory', icon: Package },
  ];

  const deliveryPersonLinks = [
    { href: '/dashboard', label: 'My Deliveries', icon: Truck },
    { href: '/dashboard/earnings', label: 'My Earnings', icon: IndianRupee },
  ];

  let navLinks;
  let dashboardTitle = 'My Dashboard';

  if (user?.role === 'store-owner') {
    navLinks = storeOwnerLinks;
    dashboardTitle = 'Store Dashboard';
  } else if (user?.role === 'delivery-person') {
    navLinks = deliveryPersonLinks;
    dashboardTitle = 'Delivery Dashboard';
  } else {
    navLinks = consumerLinks;
  }
  
  const currentLink = navLinks.find(l => pathname === l.href);
  const pageTitle = currentLink ? currentLink.label : dashboardTitle;


  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (!user) {
    return (
        <div className="container mx-auto px-4 py-8 text-center min-h-screen flex flex-col justify-center items-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-3xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground mt-2 mb-6">You must be logged in to view the dashboard.</p>
            <Link href="/login" className="text-primary hover:underline">Return to Login</Link>
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
                {getInitials(user.name || 'U')}
            </div>
            <div className='flex flex-col'>
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <Link href={link.href} passHref>
                  <SidebarMenuButton
                    isActive={pathname === link.href}
                    tooltip={{ children: link.label }}
                  >
                    <link.icon />
                    <span>{link.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
             <SidebarMenuItem>
              <Link href="/" passHref>
                <SidebarMenuButton tooltip={{ children: 'Back to Store' }}>
                  <Home />
                  <span>Back to Store</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip={{ children: 'Logout' }}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="md:hidden">
              <PanelLeft />
              <span className="sr-only">Toggle Menu</span>
            </SidebarTrigger>
            <h1 className="text-xl font-semibold grow">
                {pageTitle}
            </h1>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
