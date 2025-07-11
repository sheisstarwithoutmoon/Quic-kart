
"use client";

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { placeOrderAction } from "../../actions";
import { Frown, Loader2, MapPin, CheckCircle, Package, CreditCard, Wallet, Truck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const checkoutSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(5, "A valid ZIP code is required").max(10),
  phone: z.string().regex(/^(?:\+91)?[0-9]{10}$/, "Please enter a valid 10-digit phone number."),
  paymentMethod: z.enum(["cod"], {
    required_error: "You must select a payment method."
  }),
});

type CheckoutFormInputs = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cartItems, cartTotal, itemCount, cartStoreName } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isPlacingOrder, startOrderTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    trigger,
  } = useForm<CheckoutFormInputs>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: {
      paymentMethod: "cod",
    }
  });

  useEffect(() => {
    // If the page loads and the cart is already empty, redirect.
    if (itemCount === 0) {
      router.replace('/');
    }
  }, [itemCount, router]);

  const onPlaceOrderSubmit: SubmitHandler<CheckoutFormInputs> = (data) => {
    if (data.zip) {
      localStorage.setItem('deliveryPincode', data.zip);
      // We don't save location name here, header will fetch it.
      localStorage.removeItem('deliveryLocationName'); 
    }
    const deliveryAddress = `${data.street}, ${data.city}, ${data.state} ${data.zip}`;
    
    startOrderTransition(async () => {
      try {
        const result = await placeOrderAction({
          cartItems,
          cartTotal,
          deliveryAddress,
          phone: data.phone,
          user,
        });

        if (result.success && result.orderId) {
          // IMPORTANT: Do NOT clear cart here. Redirect first.
          router.push(`/confirmation?orderId=${result.orderId}`);
        } else {
          toast({ title: "Error placing order", description: result.error, variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "An unexpected error occurred.", variant: "destructive" });
        console.error(error);
      }
    });
  };

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Frown className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Your cart is empty.</h1>
        <p className="text-muted-foreground">Redirecting you to our stores...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-headline text-4xl font-bold text-center mb-8">Checkout</h1>
      <form onSubmit={handleSubmit(onPlaceOrderSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin /> Delivery Address</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" {...register("street")} />
                {errors.street && <p className="text-destructive text-sm mt-1">{errors.street.message}</p>}
              </div>
               <div className="md:col-span-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" {...register("phone")} />
                {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} />
                {errors.city && <p className="text-destructive text-sm mt-1">{errors.city.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...register("state")} />
                  {errors.state && <p className="text-destructive text-sm mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" {...register("zip")} />
                  {errors.zip && <p className="text-destructive text-sm mt-1">{errors.zip.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard /> Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    defaultValue="cod"
                    onValueChange={(value: "cod") => {
                      setValue("paymentMethod", value);
                      trigger("paymentMethod");
                    }}
                >
                    <Label htmlFor="cod" className="flex items-center p-4 rounded-lg border has-[:checked]:bg-primary/5 has-[:checked]:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="cod" id="cod" className="mr-4" />
                        <div className="flex-grow">
                            <p className="font-semibold flex items-center gap-2"><Truck /> Cash on Delivery</p>
                            <p className="text-sm text-muted-foreground">Pay with cash when your order arrives.</p>
                        </div>
                    </Label>
                    <div className="flex items-center p-4 rounded-lg border mt-2 opacity-50 cursor-not-allowed">
                        <RadioGroupItem value="card" id="card" className="mr-4" disabled />
                        <Label htmlFor="card" className="flex-grow cursor-not-allowed">
                            <p className="font-semibold flex items-center gap-2"><CreditCard /> Credit / Debit Card</p>
                            <p className="text-sm text-muted-foreground">Coming soon</p>
                        </Label>
                    </div>
                     <div className="flex items-center p-4 rounded-lg border mt-2 opacity-50 cursor-not-allowed">
                        <RadioGroupItem value="upi" id="upi" className="mr-4" disabled />
                        <Label htmlFor="upi" className="flex-grow cursor-not-allowed">
                            <p className="font-semibold flex items-center gap-2"><Wallet /> UPI</p>
                            <p className="text-sm text-muted-foreground">Coming soon</p>
                        </Label>
                    </div>
                </RadioGroup>
                {errors.paymentMethod && <p className="text-destructive text-sm mt-2">{errors.paymentMethod.message}</p>}
            </CardContent>
          </Card>

        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Package/> Order Summary</CardTitle>
              <CardDescription>From: <span className="font-semibold">{cartStoreName}</span> ({itemCount} items)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {cartItems.map(item => (
                        <li key={item.id} className="flex justify-between">
                            <span>{item.name} x {item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                 <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isPlacingOrder || !isValid}>
                    {isPlacingOrder ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2"/>}
                    Place Order
                </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
