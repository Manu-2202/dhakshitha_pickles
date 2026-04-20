import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dhakshitha_cart')) || [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('dhakshitha_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (pickle, weight = '500g', quantity = 1) => {
    const key = `${pickle._id}-${weight}`;
    setCart(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + quantity } : i);
      }
      const price = weight === '250g' ? pickle.price250g : weight === '1kg' ? pickle.price1kg : pickle.price500g;
      return [...prev, { key, pickleId: pickle._id, name: pickle.name, weight, price, quantity, imageUrl: pickle.imageUrl, category: pickle.category }];
    });
  };

  const removeFromCart = (key) => setCart(prev => prev.filter(i => i.key !== key));

  const updateQuantity = (key, qty) => {
    if (qty < 1) { removeFromCart(key); return; }
    setCart(prev => prev.map(i => i.key === key ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
