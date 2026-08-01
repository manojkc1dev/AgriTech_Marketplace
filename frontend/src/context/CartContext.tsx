import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  listingId: string;
  crop: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  farmerId: string;
  farmerName: string;
  district?: string;
  created_at?: string;
}

export interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  description: string;
  minOrderValue?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  totalCartValue: number;
  discountValue: number;
  finalCartValue: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: "NEPALAGRI10",
    discountType: "percentage",
    discountValue: 10,
    description: "10% Off on all organic cooperative produce",
    minOrderValue: 500,
  },
  {
    code: "FREIGHT500",
    discountType: "fixed",
    discountValue: 500,
    description: "NRs 500 Freight Subsidy Discount for bulk transportation",
    minOrderValue: 2000,
  },
  {
    code: "DHADING15",
    discountType: "percentage",
    discountValue: 15,
    description: "15% Special Discount on Dhading district direct harvests",
    minOrderValue: 1000,
  },
];

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("agritech_shopping_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("agritech_shopping_cart", JSON.stringify(cart));
    } catch {
      // Ignore storage errors
    }
  }, [cart]);

  const addToCart = (newItem: Omit<CartItem, "id">) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.listingId === newItem.listingId && i.farmerId === newItem.farmerId
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, { ...newItem, id: "cart_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4) }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);
    if (!found) {
      return { success: false, message: "Invalid coupon code. Try NEPALAGRI10 or FREIGHT500" };
    }
    const currentSubtotal = cart.reduce((s, i) => s + i.quantity * i.pricePerUnit, 0);
    if (found.minOrderValue && currentSubtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Minimum order value of NRs. ${found.minOrderValue} required for this coupon.`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Coupon '${found.code}' applied successfully! (${found.description})` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const totalCartValue = cart.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0);

  let discountValue = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountValue = Math.round((totalCartValue * appliedCoupon.discountValue) / 100);
    } else {
      discountValue = Math.min(appliedCoupon.discountValue, totalCartValue);
    }
  }

  const finalCartValue = Math.max(0, totalCartValue - discountValue);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        totalCartValue,
        discountValue,
        finalCartValue,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
