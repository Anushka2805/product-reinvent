// src/components/CheckoutForm.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutForm = ({ isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-neutral-900 text-white p-8 rounded-2xl shadow-2xl w-full max-w-lg relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">Checkout</h2>
            <form className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full p-3 bg-neutral-800 rounded-md border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <input type="email" placeholder="Email Address" className="w-full p-3 bg-neutral-800 rounded-md border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <textarea placeholder="Shipping Address" className="w-full p-3 bg-neutral-800 rounded-md border border-neutral-700 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
              <button className="w-full mt-4 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform">
                Place Order
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutForm;