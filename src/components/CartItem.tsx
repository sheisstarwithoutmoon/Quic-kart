"use client";

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useCart } from '@/hooks/use-cart';
import type { CartItem as CartItemType } from '@/lib/types';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (change: number) => {
    const newQuantity = item.quantity + change;
    updateQuantity(item.id, newQuantity);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 overflow-hidden rounded-md">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-grow">
        <h4 className="font-semibold text-sm">{item.name}</h4>
        <p className="text-muted-foreground text-xs">₹{item.price.toFixed(2)}</p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            size="icon"
            variant="outline"
            className="h-6 w-6"
            onClick={() => handleQuantityChange(-1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
          <Button
            size="icon"
            variant="outline"
            className="h-6 w-6"
            onClick={() => handleQuantityChange(1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="font-semibold text-sm">₹{(item.price * item.quantity).toFixed(2)}</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={() => removeFromCart(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
