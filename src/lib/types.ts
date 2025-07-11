

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  mrp?: number;
  discount?: string;
  image: string;
  category: string;
  storeId?: string;
  storeName?: string;
  offer?: string; // e.g., "Buy 1 Get 1 Free"
}

export interface Store {
  id: string;
  name: string;
  description: string;
  type: string;
  image: string;
  items: Item[];
}

export interface CartItem extends Item {
  quantity: number;
  storeId: string;
  storeName: string;
}

export interface Order {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  phone: string;
  storeId: string;
  items: CartItem[];
  total: number;
  deliveryAddress: string;
  status: 'placed' | 'confirmed' | 'out-for-delivery' | 'delivered';
  createdAt: string; // Changed from Timestamp to string for serialization
  otp: string;
  deliveryPersonId: string | null;
  deliveryPersonName: string | null;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'consumer' | 'store-owner' | 'delivery-person';
}
