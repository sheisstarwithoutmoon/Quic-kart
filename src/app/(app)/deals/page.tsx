
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tag, CalendarDays, ShoppingBag } from 'lucide-react';

const upcomingDeals = [
    { name: 'Summer Splash Sale', date: 'July 15th - July 20th', description: 'Big discounts on groceries and snacks.'},
    { name: 'Monsoon Mania', date: 'August 5th - August 10th', description: 'Special offers on wellness and personal care products.'},
    { name: 'Festival Bonanza', date: 'October 1st - October 5th', description: 'Get ready for the festive season with deals across all categories.'},
]

export default function DealsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Tag className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Deals & Offers</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find the best prices and special offers right here.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>No Live Deals Right Now!</CardTitle>
          <CardDescription>
            We're busy preparing the next amazing sale for you. Please check back soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                <div className="flex items-start gap-4">
                    <ShoppingBag className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-primary">Want to stay updated?</h3>
                        <p className="text-sm text-muted-foreground">Sign up for our newsletter to get notified about new deals and exclusive offers!</p>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Separator className="my-12 max-w-sm mx-auto" />

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <CalendarDays className="w-6 h-6 text-muted-foreground" />
            Upcoming Sales
        </h2>
        <div className="space-y-4">
            {upcomingDeals.map((deal) => (
                <Card key={deal.name} className="bg-muted/50 border-dashed">
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-lg">{deal.name}</h3>
                        <p className="text-primary font-medium text-sm my-1">{deal.date}</p>
                        <p className="text-muted-foreground text-sm">{deal.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
