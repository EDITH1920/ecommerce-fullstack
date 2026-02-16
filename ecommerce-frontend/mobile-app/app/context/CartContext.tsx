import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { getToken } from "@/utils/authStorage";

const API_URL = "http://127.0.0.1:5000";

interface CartContextType {
  cartCount: number;
  incrementCart: () => void;
  setCartCount: (count: number) => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  incrementCart: () => {},
  setCartCount: () => {},
  refreshCart: async () => {},
});

export const CartProvider = ({ children }: any) => {
  const [cartCount, setCartCount] = useState(0);

  // 🔄 Fetch cart count from backend
  const refreshCart = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();

      const totalItems =
        data.items?.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        ) || 0;

      setCartCount(totalItems);
    } catch (error) {
      console.log("Cart refresh error:", error);
    }
  };

  // ➕ Increment locally (used after addToCart)
  const incrementCart = () => {
    setCartCount((prev) => prev + 1);
  };

  // 🔥 Load cart once when app starts
  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        incrementCart,
        setCartCount,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
