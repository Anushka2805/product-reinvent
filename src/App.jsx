// src/App.jsx

import React, { useState, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import LandingPage from './components/LandingPage';
import CustomCursor from './components/CustomCursor';
import CartIcon from './components/CartIcon';
import CartSidebar from './components/CartSidebar'; // <-- IMPORT
import CheckoutForm from './components/CheckoutForm'; // <-- IMPORT

function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false); // <-- NEW STATE
  const [showCheckout, setShowCheckout] = useState(false); // <-- NEW STATE

  const handleAddToCart = (productToAdd) => {
    setCart((prevCart) => [...prevCart, productToAdd]);
    setIsCartOpen(true); // Open cart automatically when item is added
  };

  const handleShowCheckout = () => {
    setIsCartOpen(false); // Close cart sidebar if open
    setShowCheckout(true); // Show checkout form
  };

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  return (
    <>
      <CustomCursor />
      <CartIcon cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} />
      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onCheckout={handleShowCheckout}
      />
      <CheckoutForm isVisible={showCheckout} onClose={() => setShowCheckout(false)} />
      
      <LandingPage 
        onAddToCart={handleAddToCart}
        onShowCheckout={handleShowCheckout} 
      />
    </>
  );
}

export default App;