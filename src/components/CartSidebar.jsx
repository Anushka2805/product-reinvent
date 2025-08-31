// src/components/CartSidebar.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CartSidebar = ({ isOpen, cartItems = [], onClose, onCheckout }) => {
  const subtotal = cartItems.length * 19.99; // Example price

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[1000]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-full max-w-md h-full bg-neutral-900 text-white shadow-lg z-[1001] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-neutral-700">
              <h2 className="text-xl font-bold">Your Cart ({cartItems.length})</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow p-6 overflow-y-auto">
              {cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <img src={item.src} alt={item.label} className="w-16 h-16 rounded-md object-cover mr-4" />
                      <div>
                        <p className="font-semibold">{item.label}</p>
                        <p className="text-sm text-neutral-400">$19.99</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-neutral-400 mt-10">Your cart is empty.</p>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-neutral-700">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Subtotal</span>
                  <span className="text-xl font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;