// Cart.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context';

export function CartPage() {
  const { cart, removeFromCart, updateQty, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-6">Browse our animals and add products</p>
      <Link to="/animals" className="btn-primary">Browse Animals</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition">Clear all</button>
      </div>

      <div className="space-y-3 mb-8">
        <AnimatePresence>
          {cart.map(item => (
            <motion.div key={item.key}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {item.type === 'animal' ? '🐄' : '🧴'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-sm text-gray-400">
                  {item.final_price || item.price} MAD / {item.unit || 'unit'}
                  {item.type === 'animal' && <span className="badge-amber ml-2">Full animal</span>}
                </p>
              </div>
              {item.type !== 'animal' && (
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.key, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold transition">−</button>
                  <span className="w-6 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => updateQty(item.key, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold transition">+</button>
                </div>
              )}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-green-600">
                  {((item.final_price || item.price) * item.quantity).toFixed(2)} MAD
                </p>
                <button onClick={() => removeFromCart(item.key)} className="text-xs text-red-400 hover:text-red-600 transition">Remove</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Total */}
      <div className="card border-2 border-green-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Total</span>
          <span className="text-2xl font-bold text-green-600">{total.toFixed(2)} MAD</span>
        </div>
        <button onClick={() => navigate('/checkout')} className="btn-primary w-full text-base py-3">
          Proceed to Checkout →
        </button>
      </div>
    </div>
  );
}

export default CartPage;
