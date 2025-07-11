
"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { Item, CartItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from './use-auth';
import { useRouter } from 'next/navigation';


interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Item, options?: { silent?: boolean }) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  cartStoreName: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pendingItem, setPendingItem] = useState<Item | null>(null);
  const [itemToAddAfterLogin, setItemToAddAfterLogin] = useState<Item | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();


  const cartStoreName = cartItems.length > 0 ? cartItems[0].storeName : null;

  const handleAddToCart = (item: Item, options?: { silent?: boolean }) => {
    if (!item.storeId || !item.storeName) {
      if (!options?.silent) {
        toast({
          title: "Error",
          description: "Cannot add item without store information.",
          variant: "destructive"
        });
      }
      return;
    }

    const isDifferentStore = cartItems.length > 0 && cartItems[0].storeId !== item.storeId;

    if (isDifferentStore) {
      setPendingItem(item);
      return;
    }
    
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1, storeId: item.storeId!, storeName: item.storeName! }];
    });
    
    if (!options?.silent) {
        toast({
            title: "Added to cart!",
            description: `${item.name} is now in your basket.`,
        });
    }
  }

  const addToCart = (item: Item, options?: { silent?: boolean }) => {
    if (!user) {
        setItemToAddAfterLogin(item);
        setShowLoginPrompt(true);
        return;
    }
    handleAddToCart(item, options);
  };

  const handleConfirmClearCart = () => {
    if (!pendingItem) return;
    clearCart();
    // After clearing, add the new item. We must ensure the user is logged in.
    if (user) {
        handleAddToCart(pendingItem);
    } else {
        // This case should ideally not be hit if addToCart is guarded
        setItemToAddAfterLogin(pendingItem);
        setShowLoginPrompt(true);
    }
    setPendingItem(null);
  }

  const removeFromCart = (itemId: string) => {
    let itemRemoved: CartItem | undefined;
    setCartItems((prevItems) => {
      itemRemoved = prevItems.find(item => item.id === itemId);
      return prevItems.filter((item) => item.id !== itemId);
    });

    if (itemRemoved) {
        toast({
            title: "Item removed",
            description: `${itemRemoved.name} has been removed from your cart.`,
        });
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        cartStoreName,
      }}
    >
      {children}
      <AlertDialog open={!!pendingItem} onOpenChange={(isOpen) => !isOpen && setPendingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new cart?</AlertDialogTitle>
            <AlertDialogDescription>
              You have items from a different store. To add items from {pendingItem?.storeName}, you need to clear your current cart.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClearCart}>Clear Cart & Add</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Please Log In</AlertDialogTitle>
                <AlertDialogDescription>
                    You need to be logged in to add items to your cart.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setItemToAddAfterLogin(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => router.push('/login')}>Log In</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
