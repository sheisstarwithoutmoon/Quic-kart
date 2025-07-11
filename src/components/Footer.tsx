
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Button } from './ui/button';
import { stores } from '@/lib/data';
import Logo from './Logo';

export default function Footer() {
  const mainStoreId = stores.length > 0 ? stores[0].id : '#';

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Logo and About */}
          <div className="lg:col-span-2">
            <div className="mb-4 inline-block">
                <Logo />
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              Quickart is your one-stop shop for fast, reliable delivery of groceries, essentials, and more, right to your doorstep.
            </p>
          </div>
          
          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Blog</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link href={`/store/${mainStoreId}`} className="text-sm text-muted-foreground hover:text-primary">Groceries</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Snacks</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Medicine</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Stationery</Link></li>
            </ul>
          </div>
          
          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
            <div className="flex items-center gap-4">
              <Link href="#" aria-label="Facebook">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Facebook className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#" aria-label="Twitter">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Twitter className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#" aria-label="Instagram">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Instagram className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#" aria-label="LinkedIn">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Linkedin className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Quickart. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
