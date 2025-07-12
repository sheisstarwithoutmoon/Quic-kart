
"use server";

import { summarizeOrder, type SummarizeOrderInput } from "@/ai/flows/summarize-order-flows";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where, Timestamp, updateDoc, runTransaction } from "firebase/firestore";
import type { CartItem, Item, Order, UserProfile } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { stores } from "@/lib/data";
import { extractPrescriptionDetails, type ExtractPrescriptionInput, type ExtractPrescriptionOutput } from "@/ai/flows/extract-prescription-flow";
import { suggestAlternatives, type SuggestAlternativesInput, type SuggestAlternativesOutput } from "@/ai/flows/suggest-alternatives-flow";
import { describeImage, type DescribeImageInput, type DescribeImageOutput } from "@/ai/flows/describe-image-flow";
import { recommendProducts, type RecommendProductsInput, type RecommendProductsOutput } from "@/ai/flows/recommend-products-flow";


export async function recommendProductsAction(currentItem: Item): Promise<RecommendProductsOutput> {
    const firestoreItems = await searchItemsFromFirestore(''); // get all items
    
    const productListForAI = firestoreItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        image: item.image,
    }));
    
    const currentProductForAI = {
        id: currentItem.id,
        name: currentItem.name,
        description: currentItem.description,
        category: currentItem.category,
        image: currentItem.image,
    };

    const input: RecommendProductsInput = {
        currentItem: currentProductForAI,
        productList: productListForAI,
    };

    try {
        const output = await recommendProducts(input);
        return output;
    } catch (error) {
        console.error("Error recommending products:", error);
        return {
            recommendations: []
        };
    }
}


export async function describeImageAction(input: DescribeImageInput): Promise<DescribeImageOutput> {
    try {
        const output = await describeImage(input);
        return output;
    } catch (error) {
        console.error("Error describing image:", error);
        return { 
            isProduct: false,
            description: "An unexpected error occurred while analyzing the image."
        };
    }
}


export async function suggestAlternativesAction(query: string): Promise<SuggestAlternativesOutput> {
    const firestoreItems = await searchItemsFromFirestore(''); // get all items
    
    const productsForAI = firestoreItems.map(item => ({
        name: item.name,
        description: item.description,
        category: item.category,
    }));

    const input: SuggestAlternativesInput = {
        query,
        products: productsForAI
    };
    
    try {
        const output = await suggestAlternatives(input);
        return output;
    } catch (error) {
        console.error("Error suggesting alternatives:", error);
        return {
            responseMessage: "I'm sorry, but I encountered an error while trying to find alternatives for you. Please try again later.",
            suggestions: []
        };
    }
}


export async function extractPrescriptionAction(input: ExtractPrescriptionInput): Promise<ExtractPrescriptionOutput> {
    try {
        const output = await extractPrescriptionDetails(input);
        return output;
    } catch (error) {
        console.error("Error extracting prescription details:", error);
        return { 
            isReadable: false,
            medicines: [],
            error: "An unexpected error occurred while analyzing the prescription."
        };
    }
}

interface PlaceOrderActionInput {
    cartItems: CartItem[];
    cartTotal: number;
    deliveryAddress: string;
    phone: string;
    user: {
      uid: string;
      name: string | null;
      email: string | null;
    } | null;
  }

export async function placeOrderAction(input: PlaceOrderActionInput) {
    if (!db) {
        return { success: false, error: "Firestore is not initialized." };
    }
    if (input.cartItems.length === 0) {
        return { success: false, error: "Cannot place an empty order." };
    }

    const storeId = input.cartItems[0].storeId;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    try {
        const orderId = await runTransaction(db, async (transaction) => {
            // 1. First, read ALL documents to check stock availability
            const itemRefs = input.cartItems.map(cartItem => doc(db!, "items", cartItem.id));
            const itemDocs = await Promise.all(
                itemRefs.map(itemRef => transaction.get(itemRef))
            );

            // 2. Validate stock for all items
            const stockUpdates: { ref: any; newStock: number; cartItem: CartItem }[] = [];
            
            for (let i = 0; i < itemDocs.length; i++) {
                const itemDoc = itemDocs[i];
                const cartItem = input.cartItems[i];
                
                if (!itemDoc.exists()) {
                    throw new Error(`Item ${cartItem.name} not found.`);
                }

                const currentStock = itemDoc.data().stock;
                if (currentStock < cartItem.quantity) {
                    throw new Error(`Not enough stock for ${cartItem.name}. Only ${currentStock} left.`);
                }

                const newStock = currentStock - cartItem.quantity;
                stockUpdates.push({
                    ref: itemRefs[i],
                    newStock,
                    cartItem
                });
            }

            // 3. Now perform all writes (stock updates and order creation)
            // Update stock for all items
            stockUpdates.forEach(({ ref, newStock }) => {
                transaction.update(ref, { stock: newStock });
            });
            
            // Create the order document
            const orderData = {
                userId: input.user?.uid || null,
                userName: input.user?.name || null,
                userEmail: input.user?.email || null,
                storeId: storeId,
                items: input.cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    storeId: item.storeId,
                    storeName: item.storeName,
                    offer: item.offer || null,
                })),
                total: input.cartTotal,
                deliveryAddress: input.deliveryAddress,
                phone: input.phone,
                status: 'placed' as const,
                createdAt: serverTimestamp(),
                otp,
                deliveryPersonId: null,
                deliveryPersonName: null,
            };

            const orderCol = collection(db!, "orders");
            const newOrderRef = doc(orderCol); // Create a new document reference with an auto-generated ID
            transaction.set(newOrderRef, orderData);

            return newOrderRef.id;
        });

        // 4. Revalidate paths after successful transaction
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/inventory');
        input.cartItems.forEach(item => {
            revalidatePath(`/product/${item.id}`);
        });

        return { success: true, orderId: orderId };

    } catch (error) {
        console.error("Error placing order:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to place order due to an unexpected error.";
        return { success: false, error: errorMessage };
    }
}

export async function getOrderAction(orderId: string) {
    if (!db) {
      return { success: false, error: "Firestore is not initialized." };
    }
  
    try {
      const orderDoc = await getDoc(doc(db, "orders", orderId));
  
      if (!orderDoc.exists()) {
        return { success: false, error: "Order not found." };
      }
      
      const orderData = orderDoc.data();
      const createdAt = orderData.createdAt as Timestamp;

      const serializableOrder = {
        ...orderData,
        id: orderDoc.id,
        createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
      };
  
      return { success: true, order: serializableOrder as unknown as Order };
    } catch (error) {
      console.error("Error fetching order:", error);
      return { success: false, error: "Failed to fetch order details." };
    }
  }

interface AddItemActionInput {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    storeId: string;
    imageDataUri: string;
}

export async function addItemAction(input: AddItemActionInput) {
    if (!db) {
        return { success: false, error: "Firestore is not initialized." };
    }

    try {
        const storeDoc = stores.find(s => s.id === input.storeId);
        if (!storeDoc) {
            return { success: false, error: `Store with ID "${input.storeId}" was not found.` };
        }
        
        const newItemDataForFirestore = {
            name: input.name,
            description: input.description,
            price: input.price,
            stock: input.stock,
            category: input.category,
            storeId: input.storeId,
            storeName: storeDoc.name,
            image: input.imageDataUri,
        };

        await addDoc(collection(db, "items"), newItemDataForFirestore);
        
        revalidatePath(`/store/${input.storeId}`);
        revalidatePath('/search');
        revalidatePath('/dashboard/inventory');


        return { success: true };
    } catch (error) {
        console.error("Error in addItemAction:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to add new item. Reason: ${errorMessage}` };
    }
}

interface UpdateItemActionInput {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
}

export async function updateItemAction(input: UpdateItemActionInput) {
    if (!db) {
        return { success: false, error: "Firestore is not initialized." };
    }
    
    try {
        const itemRef = doc(db, "items", input.id);
        const itemToUpdate = {
            name: input.name,
            description: input.description,
            price: input.price,
            stock: input.stock,
            category: input.category,
        };
        await updateDoc(itemRef, itemToUpdate);
        
        revalidatePath(`/product/${input.id}`);
        revalidatePath('/dashboard/inventory');
        revalidatePath(`/store/quickart-essentials`);
        revalidatePath('/search');

        return { success: true };
    } catch (error) {
        console.error("Error in updateItemAction:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to update item. Reason: ${errorMessage}` };
    }
}

export async function getItemsFromFirestore(storeId: string): Promise<Item[]> {
    if (!db) return [];
    try {
        const itemsCol = collection(db, "items");
        const q = query(itemsCol, where("storeId", "==", storeId));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Item[];
        return items;
    } catch (error) {
        console.error("Error fetching items from Firestore:", error);
        return [];
    }
}

export async function searchItemsFromFirestore(searchQuery: string): Promise<Item[]> {
    if (!db) return [];
    try {
        const itemsCol = collection(db, "items");
        const querySnapshot = await getDocs(itemsCol);
        const allItems = querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id})) as Item[];
        
        if (!searchQuery) {
            return allItems;
        }

        const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term);
        return allItems.filter(item => {
            const itemText = (item.name + ' ' + item.description).toLowerCase();
            return searchTerms.some(term => itemText.includes(term));
        });
    } catch (error) {
        console.error("Error searching items in Firestore:", error);
        return [];
    }
}

interface UpdateOrderStatusInput {
    orderId: string;
    status: Order['status'];
}

export async function updateOrderStatusAction(input: UpdateOrderStatusInput): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "Firestore is not initialized." };
    }

    try {
        const orderRef = doc(db, "orders", input.orderId);
        await updateDoc(orderRef, {
            status: input.status
        });
        
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, error: "Failed to update order status." };
    }
}

export async function getDeliveryPeople(): Promise<UserProfile[]> {
    if (!db) return [];
    try {
        const usersCol = collection(db, "users");
        const q = query(usersCol, where("role", "==", "delivery-person"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
        console.error("Error fetching delivery people:", error);
        return [];
    }
}

interface AssignDeliveryPersonInput {
    orderId: string;
    deliveryPerson: UserProfile;
}

export async function assignDeliveryPersonAction(input: AssignDeliveryPersonInput): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "Firestore is not initialized." };
    }

    try {
        const orderRef = doc(db, "orders", input.orderId);
        await updateDoc(orderRef, {
            deliveryPersonId: input.deliveryPerson.uid,
            deliveryPersonName: input.deliveryPerson.name,
            status: 'out-for-delivery'
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error assigning delivery person:", error);
        return { success: false, error: "Failed to assign delivery person." };
    }
}

interface VerifyOtpInput {
    orderId: string;
    otp: string;
}

export async function verifyOtpAndCompleteOrderAction(input: VerifyOtpInput): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "Firestore is not initialized." };
    }
    
    try {
        const orderRef = doc(db, "orders", input.orderId);
        const orderDoc = await getDoc(orderRef);

        if (!orderDoc.exists()) {
            return { success: false, error: "Order not found." };
        }

        const orderData = orderDoc.data();
        if (orderData.otp !== input.otp) {
            return { success: false, error: "Invalid OTP. Please try again." };
        }

        await updateDoc(orderRef, {
            status: 'delivered'
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return { success: false, error: "Failed to verify OTP." };
    }
}

export async function generateSummaryAction(input: SummarizeOrderInput): Promise<string | null> {
    try {
        const result = await summarizeOrder(input);
        return result.summary;
    } catch (error) {
        console.error("Error generating order summary:", error);
        return null;
    }
}

