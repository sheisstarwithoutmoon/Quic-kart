'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, MapPin } from 'lucide-react';

export default function OrderConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const summary = searchParams.get('summary');
  const address = searchParams.get('address');

  if (!summary || !address) {
    // This can happen if the user navigates here directly.
    // Redirect them to home.
    if (typeof window !== 'undefined') {
        router.replace('/');
    }
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-2xl text-center shadow-lg animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader className="items-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <CardTitle className="font-headline text-4xl">Order Placed Successfully!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Your local goodies are on their way.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="bg-muted p-6 rounded-lg border text-left">
                <h3 className="font-semibold mb-2">Order Summary:</h3>
                <p className="font-mono text-sm whitespace-pre-wrap">{summary}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg border text-left">
                <h3 className="font-semibold mb-2 flex items-center gap-2"><MapPin className="w-4 h-4"/> Shipping to:</h3>
                <p className="text-muted-foreground">{address}</p>
            </div>
          <Button size="lg" onClick={() => router.push('/')} className="w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
