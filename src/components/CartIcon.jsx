// src/components/CartIcon.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// src/components/CartIcon.jsx

// ... (imports remain the same)

const CartIcon = ({ cartCount, onOpenCart }) => { // <-- Add onOpenCart prop
  return (
    <div onClick={onOpenCart} className="fixed top-6 right-6 md:top-8 md:right-8 z-[900] cursor-pointer"> {/* Changed z-index */}
      {/* ... (rest of the component is the same) */}
    </div>
  );
};

export default CartIcon;