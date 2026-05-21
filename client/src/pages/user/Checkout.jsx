import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart, useAuth } from '../../context';
import { createOrder } from '../../services/api';

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: review  2: confirm  3: done
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    setLoading(true);
    try {
      const items = cart.map(item => ({
        product_id: item.type === 'product' ? item._id : undefined,
        animal_id:  item.type === 'animal'  ? item._id : undefined,
        quantity:   item.quantity,
        price:      item.final_price || item.price,
        item_type:  item.type,
      }));
      await createOrder({ items, total_price: total, note });
      clearCart();
      setStep(3);
    } catch { toast.error('Order failed, please try again'); }
    finally { setLoading(false); }
  };

  if (cart.length === 0 && step !== 3) { navigate('/cart'); return null; }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-4 mb-10">
        {['Review', 'Confirm', 'Done'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step > i + 1 ? 'bg-green-500 text-white' :
              step === i + 1 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
            }`}>{step > i + 1 ? '✓' : i + 1}</div>
            <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
            {i < 2 && <div className="w-8 h-0.5 bg-gray-200 hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* Step 1: Review */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Review your order</h2>
          <div className="space-y-3 mb-6">
            {cart.map(item => (
              <div key={item.key} className="card flex items-center gap-4">
                <div className="text-2xl">{item.type === 'animal' ? '🐄' : '🧴'}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-400">x{item.quantity} • {item.final_price || item.price} MAD each</p>
                </div>
                <p className="font-bold text-green-600">{((item.final_price || item.price) * item.quantity).toFixed(2)} MAD</p>
              </div>
            ))}
          </div>
          <div className="card border border-green-100 mb-6">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-green-600">{total.toFixed(2)} MAD</span>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Want to add anything else? (optional note)</label>
            <textarea className="input" rows={3} placeholder="Any special requests or notes..."
              value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <button onClick={() => setStep(2)} className="btn-primary w-full py-3 text-base">
            Continue to Confirm →
          </button>
        </motion.div>
      )}

      {/* Step 2: Confirm */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm your order?</h2>
          <p className="text-gray-400 mb-2">Total: <span className="text-green-600 font-bold">{total.toFixed(2)} MAD</span></p>
          <p className="text-gray-400 mb-2">{cart.length} item(s) for <span className="font-medium">{user?.name}</span></p>
          {note && <p className="text-gray-400 text-sm mb-6 italic">Note: "{note}"</p>}
          <div className="flex gap-3 mt-8">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
            <button onClick={handleOrder} disabled={loading} className="btn-primary flex-1 py-3 text-base">
              {loading ? 'Placing order...' : '✅ Place Order'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Done */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            className="text-7xl mb-6">🎉</motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order placed!</h2>
          <p className="text-gray-400 mb-8">We'll contact you to confirm delivery. Check your orders for updates.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/orders')} className="btn-primary px-8">View orders</button>
            <button onClick={() => navigate('/animals')} className="btn-secondary px-8">Continue shopping</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
