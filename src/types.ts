export enum OrderStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  ice: string;
  sugar: string;
  toppings: string[];
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: any; // Firestore Timestamp
}

export interface ShopSettings {
  shopName: string;
  isOpen: boolean;
  announcement: string;
}
