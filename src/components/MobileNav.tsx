
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Store, Tag, User, Home, ScrollText, LogOut } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { User as AuthUser } from "@/hooks/use-auth"

const navLinks = [
    { name: 'Groceries', href: '/category/groceries' },
    { name: 'Snacks', href: '/category/snacks' },
    { name: 'Medicine', href: '/category/medicine' },
    { name: 'Stationery', href: '/category/stationery' },
    { name: 'Value Store', href: '/value-store' },
    { name: 'Deals', href: '/deals' },
];

interface MobileNavProps {
    user: AuthUser | null;
    handleLogout: () => void;
}

export function MobileNav({ user, handleLogout }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-sm">
        <div className="flex flex-col h-full">
            <div className="p-6 border-b">
                <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                    <Store className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl">Quickart</span>
                </Link>
            </div>
            <div className="flex-grow overflow-y-auto">
                <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="px-6 py-4 font-semibold">Categories</AccordionTrigger>
                        <AccordionContent>
                            <nav className="grid gap-2 px-6 pb-4">
                            {navLinks.map((link) => (
                                <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className={`-ml-2 p-2 rounded-md font-medium flex items-center gap-2 ${
                                    pathname === link.href
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent"
                                }`}
                                >
                                <Tag className="h-4 w-4" />
                                {link.name}
                                </Link>
                            ))}
                            </nav>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            <div className="p-6 border-t mt-auto">
                {user ? (
                    <div className="space-y-2">
                        <p className="font-semibold">{user.name}</p>
                        <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                            <ScrollText className="w-4 h-4" />
                            Dashboard
                        </Link>
                        <Button variant="ghost" onClick={() => { handleLogout(); setOpen(false); }} className="w-full justify-start p-0 h-auto text-muted-foreground hover:text-foreground">
                             <LogOut className="w-4 h-4 mr-2" />
                             Logout
                        </Button>
                    </div>
                ) : (
                    <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-2 font-medium">
                        <User className="h-5 w-5" />
                        Log in / Sign up
                    </Link>
                )}
            </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
