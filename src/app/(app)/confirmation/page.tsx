
'use client';

import { Suspense, useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Home, MapPin, Package, AlertCircle, Loader2, MessageSquare, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { generateSummaryAction, getOrderAction } from '../../actions';
import type { Order } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';

interface ConfirmationContentProps {
    orderId: string | null;
}

function ConfirmationContent({ orderId }: ConfirmationContentProps) {
  const { clearCart } = useCart();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryLoading, startSummaryTransition] = useTransition();

  useEffect(() => {
    if (!orderId) {
      setError("No order ID was provided.");
      setLoading(false);
      return;
    }

    const fetchOrderAndGenerateSummary = async () => {
      try {
        setLoading(true);
        const result = await getOrderAction(orderId);
        if (result.success && result.order) {
          const fetchedOrder = result.order;
          setOrder(fetchedOrder);
          clearCart(); // Clear the cart only after successfully fetching the order

          startSummaryTransition(async () => {
              const summaryResult = await generateSummaryAction({
                  items: fetchedOrder.items.map(item => ({ name: item.name, quantity: item.quantity })),
                  total: fetchedOrder.total,
                  deliveryAddress: fetchedOrder.deliveryAddress
              });
              setSummary(summaryResult);
          });

        } else {
          setError(result.error || "We couldn't find the details for this order.");
        }
      } catch (e: any) {
        console.error("Failed to fetch order:", e);
        setError("An unexpected error occurred while fetching your order.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndGenerateSummary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[70vh]">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
        </div>
    );
  }

  if (error || !order) {
    return (
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[70vh]">
            <Card className="w-full max-w-2xl text-center shadow-lg">
                <CardHeader className="items-center">
                    <AlertCircle className="w-16 h-16 text-destructive mb-4" />
                    <CardTitle className="font-headline text-4xl">Order Error</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                        {error || "An unknown error occurred."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
                </CardContent>
            </Card>
        </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-2xl shadow-lg animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <CardTitle className="text-4xl font-bold">Order Placed Successfully!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Your local goodies are on their way. Order ID: #{order.id.substring(0, 6)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-left">
            <div className="bg-muted p-6 rounded-lg border">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Package/> Order Details</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {order.items.map((item: any) => (
                        <li key={item.id} className="flex justify-between">
                            <span>{item.name} x {item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>₹{order.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2"><MapPin className="w-4 h-4"/> Shipping to:</h3>
                <p className="text-muted-foreground">{order.deliveryAddress}</p>
            </div>

            <div className="p-4 rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary"/> AI Order Summary</h3>
                <div className="min-h-[6rem] flex items-center justify-center">
                    {isSummaryLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Wand2 className="w-5 h-5 animate-pulse text-primary"/>
                            <span>Generating summary...</span>
                        </div>
                    ) : summary ? (
                        <div className="flex items-start gap-4">
                            <p className="font-mono text-sm whitespace-pre-wrap">{summary}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-destructive">Sorry, we couldn't generate a summary for this order.</p>
                    )}
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 pt-6">
            <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home & Continue Shopping
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function ConfirmationPageWrapper() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return <ConfirmationContent orderId={orderId} />
}

export default function OrderConfirmationPage() {
    return (
      <Suspense fallback={<div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[70vh]"><Loader2 className="w-16 h-16 text-primary animate-spin" /></div>}>
        <ConfirmationPageWrapper />
      </Suspense>
    );
}
