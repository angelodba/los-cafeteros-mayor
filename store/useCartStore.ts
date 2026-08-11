import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '../types/catalog';

export interface CartItem {
  product: Product;
  qty: number;
}

interface CartState {
  cart: CartItem[];
  isCartOpen: boolean;
  isLocationModalOpen: boolean;
  billingData: { restName: string; rif: string; zone: string; phone?: string };
  
  // Actions
  addToCart: (product: Product, qty: number) => void;
  updateQty: (productId: string, newQty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setIsCartOpen: (isOpen: boolean) => void;
  setIsLocationModalOpen: (isOpen: boolean) => void;
  setBillingData: (data: { restName: string; rif: string; zone: string; phone?: string }) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      isCartOpen: false,
      isLocationModalOpen: true,
      billingData: { restName: '', rif: '', zone: '', phone: '' },

      addToCart: (product, qty) =>
        set((state) => {
          const existing = state.cart.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.product.id === product.id ? { ...i, qty: i.qty + qty } : i
              ),
              isCartOpen: true,
            };
          }
          return { cart: [...state.cart, { product, qty }], isCartOpen: true };
        }),

      updateQty: (productId, newQty) =>
        set((state) => {
          if (newQty <= 0) {
            return { cart: state.cart.filter((i) => i.product.id !== productId) };
          }
          return {
            cart: state.cart.map((i) =>
              i.product.id === productId ? { ...i, qty: newQty } : i
            ),
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.product.id !== productId),
        })),

      clearCart: () => set({ cart: [] }),
      
      setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
      setIsLocationModalOpen: (isOpen) => set({ isLocationModalOpen: isOpen }),
      setBillingData: (data) => set({ billingData: data }),
    }),
    {
      name: 'loscafeteros_cart_v7',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
